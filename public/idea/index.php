<?php
/**
 * DBS Studio /idea/ — isolated, server-rendered private ideas archive.
 * Ideas are written at runtime to .ideas.php on the host; NEVER committed to git.
 * Requires the same Apache + PHP hosting used by /api/contact.php.
 */
declare(strict_types=1);

const IDEA_PASSWORD_HASH = '$2y$12$jkdip4u4THVXINzeUeuVTuBcCA65kd0yR2Ij5XCNyl3I./FDESYEK';
require_once __DIR__ . '/storage.php';
const IDEA_MAX_POST_BYTES = 75000;

date_default_timezone_set('Asia/Tehran');
header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('Cache-Control: private, no-store, max-age=0');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('X-Frame-Options: DENY');

session_name('dbs_ideas');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/idea/',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

if (!isset($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(24));
}

function e(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
function plain(mixed $value): string {
    return is_string($value) ? $value : '';
}
function bodyText(string $value): string {
    // Escape before linking external references; no Markdown/HTML execution.
    $escaped = e($value);
    $linked = preg_replace_callback('~https?://[^\s<>"\']+~iu', static function(array $m): string {
        $url = html_entity_decode($m[0], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        if (!filter_var($url, FILTER_VALIDATE_URL)) return $m[0];
        return '<a href="' . e($url) . '" target="_blank" rel="noopener noreferrer nofollow">' . e($url) . '</a>';
    }, $escaped);
    return nl2br($linked ?? $escaped);
}
function loginBlocked(): bool {
    $file = sys_get_temp_dir() . '/dbs_idea_login_' . hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $lock = @fopen($file, 'c+');
    if (!$lock || !flock($lock, LOCK_EX)) return true; // fail closed
    try {
        rewind($lock);
        $events = json_decode(stream_get_contents($lock) ?: '[]', true);
        $events = is_array($events) ? $events : [];
        $events = array_values(array_filter($events, static fn($v) => is_int($v) && $v >= time() - 900));
        $blocked = count($events) >= 8;
        if (!$blocked) $events[] = time(); // count every attempt, successful included
        rewind($lock);
        ftruncate($lock, 0);
        fwrite($lock, json_encode($events));
        fflush($lock);
        return $blocked;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

$error = '';
$notice = '';
$authorized = ($_SESSION['idea_auth'] ?? false) === true;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postedLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($postedLength > IDEA_MAX_POST_BYTES) {
        http_response_code(413);
        $error = 'حجم اطلاعات بیش از حد مجاز است.';
    } elseif (!hash_equals((string)$_SESSION['csrf'], plain($_POST['csrf'] ?? ''))) {
        http_response_code(403);
        $error = 'نشست منقضی شده است؛ صفحه را دوباره باز کن.';
    } else {
        $action = plain($_POST['action'] ?? '');
        if ($action === 'logout') {
            $_SESSION = [];
            session_regenerate_id(true);
            header('Location: /idea/', true, 303);
            exit;
        }
        if ($action === 'login' && !$authorized) {
            $candidate = plain($_POST['password'] ?? '');
            if (loginBlocked()) {
                http_response_code(429);
                $error = 'تلاش‌های زیادی انجام شده؛ ۱۵ دقیقه دیگر امتحان کن.';
            } elseif (strlen($candidate) <= 64 && password_verify($candidate, IDEA_PASSWORD_HASH)) {
                session_regenerate_id(true);
                $_SESSION['idea_auth'] = true;
                $_SESSION['csrf'] = bin2hex(random_bytes(24));
                header('Location: /idea/', true, 303);
                exit;
            } else {
                $error = 'رمز عبور درست نیست.';
            }
        } elseif ($action === 'add' && $authorized) {
            $fields = ['title','category','audience','problem','evidence','product','pricing','mvp','risk','acquisition','validation','notes'];
            $idea = [];
            foreach ($fields as $field) {
                $idea[$field] = trim(plain($_POST[$field] ?? ''));
                if (mb_strlen($idea[$field]) > ($field === 'evidence' ? 5000 : 2500)) {
                    $error = 'متن یکی از بخش‌ها بیش از حد طولانی است.';
                }
            }
            $date = plain($_POST['date'] ?? '');
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !checkdate((int)substr($date,5,2), (int)substr($date,8,2), (int)substr($date,0,4))) {
                $error = 'تاریخ باید میلادی و به قالب YYYY-MM-DD باشد.';
            }
            if ($idea['title'] === '' || $idea['category'] === '' || $idea['audience'] === '' || $idea['problem'] === '') {
                $error = 'نام، دسته، مشتری هدف و مسئله را وارد کن.';
            }
            $metrics = ['demand','differentiation','build','reach','revenue','scale'];
            $scores = [];
            foreach ($metrics as $metric) {
                $value = filter_var($_POST['score_'.$metric] ?? null, FILTER_VALIDATE_INT);
                if ($value === false || $value < 0 || $value > 10) {
                    $error = 'امتیاز هر معیار باید عددی بین ۰ تا ۱۰ باشد.';
                    break;
                }
                $scores[$metric] = $value;
            }
            if ($error === '') {
                $idea['date'] = $date;
                $idea['scores'] = $scores;
                $idea['score'] = round(array_sum($scores) / count($scores), 1);
                $idea['id'] = hash('sha256', $date . '|' . mb_strtolower($idea['title']));
                $idea['added_at'] = date('c');
                if (ideaStoreItem($idea)) {
                    header('Location: /idea/?added=1', true, 303);
                    exit;
                }
                $error = 'ذخیره انجام نشد. امکان نوشتن روی هاست یا تکراری بودن ایده را بررسی کن.';
            }
        }
    }
}
$authorized = ($_SESSION['idea_auth'] ?? false) === true;
$ideas = $authorized ? ideaReadItems() : [];
usort($ideas, static fn($a, $b) => strcmp((string)($b['added_at'] ?? ''), (string)($a['added_at'] ?? '')));
$count = count($ideas);
$avg = $count ? round(array_sum(array_map(static fn($i) => (float)($i['score'] ?? 0), $ideas)) / $count, 1) : 0;
$metricLabels = [
    'demand'=>'شواهد تقاضا', 'differentiation'=>'فرصت تمایز', 'build'=>'سادگی MVP',
    'reach'=>'دسترسی به مشتری', 'revenue'=>'پتانسیل درآمد', 'scale'=>'مقیاس‌پذیری',
];
?>
<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<meta name="theme-color" content="#edeee9">
<title>آرشیو ایده‌ها | DBS Studio</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/idea/style.css">
</head>
<body>
<?php if (!$authorized): ?>
<main class="login-layout">
  <div class="login-card">
    <div class="mark">DBS<span> / </span>IDEAS</div>
    <span class="eyebrow">PRIVATE WORKSPACE · فضای خصوصی</span>
    <h1>ایده‌ها اینجان<span class="dot">.</span></h1>
    <p class="subdued">آرشیو شخصی فرصت‌های بررسی‌شده؛ فقط با رمز ورود.</p>
    <?php if ($error !== ''): ?><p class="alert" role="alert"><?= e($error) ?></p><?php endif; ?>
    <form method="post" class="login-form">
      <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
      <input type="hidden" name="action" value="login">
      <label for="password">رمز ورود</label>
      <input autofocus required type="password" id="password" name="password" autocomplete="current-password" maxlength="64" placeholder="••••••••">
      <button type="submit" class="primary">ورود به آرشیو <span aria-hidden="true">←</span></button>
    </form>
    <p class="smallnote">DBS Studio · Idea Archive</p>
  </div>
</main>
<?php else: ?>
<div class="shell">
  <header class="topbar">
    <a class="mark" href="/idea/" aria-label="آرشیو ایده‌ها">DBS<span> / </span>IDEAS</a>
    <form method="post">
      <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
      <input type="hidden" name="action" value="logout">
      <button type="submit" class="quiet">خروج <span aria-hidden="true">↗</span></button>
    </form>
  </header>
  <main>
    <div class="intro">
      <div>
        <span class="eyebrow">PRIVATE IDEA LIBRARY · پایگاه ایده‌ها</span>
        <h1>ایده‌های پول‌ساز<span class="dot">.</span></h1>
        <p class="subdued">ایده‌ها فقط یک شروع‌اند؛ شواهد، اعتبارسنجی و فروش مهم‌ترند.</p>
      </div>
      <a class="back-link" href="https://dbsstudio.ir/" rel="noreferrer">DBS Studio ↗</a>
    </div>

    <section class="stats" aria-label="آمار آرشیو">
      <div class="stat"><span>ایده‌های ثبت‌شده</span><strong><?= $count ?></strong></div>
      <div class="stat"><span>میانگین امتیاز</span><strong><?= $count ? e((string)$avg) : '—' ?><small> / ۱۰</small></strong></div>
      <div class="stat"><span>آخرین ثبت</span><strong class="date"><?= $count ? e((string)($ideas[0]['date'] ?? '—')) : '—' ?></strong></div>
    </section>

    <?php if (($_GET['added'] ?? '') === '1'): ?><p class="success" role="status">ایده جدید با موفقیت به آرشیو اضافه شد.</p><?php endif; ?>
    <?php if ($error !== ''): ?><p class="alert" role="alert"><?= e($error) ?></p><?php endif; ?>

    <details class="composer" id="new-idea" <?= $error ? 'open' : '' ?>>
      <summary><span class="plus" aria-hidden="true">＋</span><strong>افزودن ایده جدید</strong><small>فرم مدیریت خصوصی</small></summary>
      <form method="post" class="idea-form">
        <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
        <input type="hidden" name="action" value="add">
        <div class="form-grid">
          <label>نام ایده <input name="title" maxlength="200" required placeholder="مثلاً ابزار ..."></label>
          <label>دسته <select name="category" required>
            <option value="">انتخاب دسته</option>
            <?php foreach (['افزونه وردپرس','اپ اندروید','SaaS','ابزار B2B','ابزار AI','محصول ارزان و پرفروش','سلامت و دارو','خدمات محصول‌سازی‌شده','سایر'] as $cat): ?>
              <option value="<?= e($cat) ?>"><?= e($cat) ?></option>
            <?php endforeach; ?>
          </select></label>
          <label>تاریخ تحقیق (میلادی) <input type="date" name="date" required value="<?= e(date('Y-m-d')) ?>"></label>
          <label>مشتری هدف <input name="audience" required maxlength="800"></label>
        </div>
        <label>مسئله <textarea name="problem" required rows="2"></textarea></label>
        <label>شواهد تقاضا و رقبا (با لینک و تاریخ) <textarea name="evidence" rows="3" placeholder="واقعیت مستند را از فرضیه‌ها جدا کن"></textarea></label>
        <label>محصول و وجه تمایز <textarea name="product" rows="2"></textarea></label>
        <div class="form-grid">
          <label>قیمت و مدل درآمد (تومان) <textarea name="pricing" rows="2" placeholder="قیمت مستند یا فرضیه قابل آزمون"></textarea></label>
          <label>هزینه و زمان MVP <textarea name="mvp" rows="2"></textarea></label>
          <label>ریسک اصلی <textarea name="risk" rows="2"></textarea></label>
          <label>جذب ۱۰ مشتری اول <textarea name="acquisition" rows="2"></textarea></label>
        </div>
        <label>آزمون اعتبارسنجی و معیار موفقیت / شکست <textarea name="validation" rows="2"></textarea></label>
        <label>فرض‌ها و یادداشت‌ها <textarea name="notes" rows="2"></textarea></label>
        <fieldset class="score-fields"><legend>امتیاز ۶ معیار (۰ تا ۱۰)</legend>
          <?php foreach ($metricLabels as $key => $label): ?><label><?= e($label) ?><input required type="number" name="score_<?= e($key) ?>" min="0" max="10" step="1" value="5"></label><?php endforeach; ?>
        </fieldset>
        <button type="submit" class="primary">ثبت در آرشیو ←</button>
      </form>
    </details>

    <div class="list-head">
      <div><span class="eyebrow">THE ARCHIVE</span><h2>همه ایده‌ها</h2></div>
      <label class="search-wrap"><span class="sr-only">جستجوی ایده</span><input id="idea-search" type="search" placeholder="جستجو در ایده‌ها..." autocomplete="off"></label>
    </div>
    <div class="filters" id="idea-filters" aria-label="فیلتر دسته‌ها">
      <button type="button" class="filter active" data-category="all" aria-pressed="true">همه</button>
      <?php foreach (array_unique(array_map(static fn($i) => (string)($i['category'] ?? ''), $ideas)) as $cat): ?>
        <?php if ($cat !== ''): ?><button type="button" class="filter" data-category="<?= e($cat) ?>" aria-pressed="false"><?= e($cat) ?></button><?php endif; ?>
      <?php endforeach; ?>
    </div>
    <div class="ideas" id="idea-list">
      <?php foreach ($ideas as $index => $idea): ?>
        <article class="idea-card" data-category="<?= e((string)($idea['category'] ?? '')) ?>" data-search="<?= e(mb_strtolower(implode(' ', array_filter(array_map('plain', array_values(array_diff_key($idea, array_flip(['scores'])))))))) ?>">
          <div class="card-top"><div><span class="category"><?= e((string)($idea['category'] ?? '')) ?></span><span class="entry-date"><?= e((string)($idea['date'] ?? '')) ?></span></div><span class="score-pill"><?= e((string)($idea['score'] ?? '—')) ?><small> / ۱۰</small></span></div>
          <h3><?= e((string)($idea['title'] ?? '')) ?></h3>
          <p class="summary"><?= e((string)($idea['problem'] ?? '')) ?></p>
          <div class="audience"><span>مشتری هدف</span><strong><?= e((string)($idea['audience'] ?? '')) ?></strong></div>
          <details class="read-more" <?= $index === 0 ? 'open' : '' ?>><summary>جزئیات و بررسی <span aria-hidden="true">＋</span></summary>
            <div class="detail-grid">
              <?php foreach ([
                'evidence'=>'شواهد تقاضا و رقبا', 'product'=>'محصول و تمایز',
                'pricing'=>'مدل درآمد و قیمت', 'mvp'=>'زمان و هزینه MVP',
                'risk'=>'ریسک اصلی', 'acquisition'=>'۱۰ مشتری اول',
                'validation'=>'آزمون اعتبارسنجی', 'notes'=>'فرضیات و یادداشت‌ها',
              ] as $field => $label): ?>
                <?php if (!empty($idea[$field])): ?><section><h4><?= e($label) ?></h4><p><?= bodyText((string)$idea[$field]) ?></p></section><?php endif; ?>
              <?php endforeach; ?>
            </div>
            <div class="scoreboard">
              <h4>ارزیابی فرصت</h4>
              <div class="metrics">
                <?php foreach ($metricLabels as $key => $label): $n = (float)($idea['scores'][$key] ?? 0); ?>
                  <div class="metric"><div><span><?= e($label) ?></span><b><?= e((string)$n) ?> / ۱۰</b></div><progress max="10" value="<?= e((string)$n) ?>"><?= e((string)$n) ?></progress></div>
                <?php endforeach; ?>
              </div>
            </div>
          </details>
        </article>
      <?php endforeach; ?>
    </div>
    <?php if ($count === 0): ?>
      <div class="empty" id="empty-state"><div aria-hidden="true">✳</div><h3>هنوز ایده‌ای ثبت نشده</h3><p>از فرم «افزودن ایده جدید» شروع کن. این صفحه فقط داده‌های واقعی ثبت‌شده را نمایش می‌دهد.</p></div>
    <?php else: ?><p class="no-matches" id="no-matches" hidden>ایده‌ای با این جستجو پیدا نشد.</p><?php endif; ?>
  </main>
  <footer class="footer">DBS Studio <span>·</span> Private Ideas Archive <span>·</span> اطلاعات فقط پس از ورود نمایش داده می‌شود</footer>
</div>
<script src="/idea/app.js" defer></script>
<?php endif; ?>
</body></html>
