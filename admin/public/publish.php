<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
$auth->requireLogin();

$diff = null;
$result = null;
$error = null;

try {
    $diff = $publisher->previewDiff();
} catch (Throwable $e) {
    $error = $e->getMessage();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf($auth);
    $action = $_POST['action'] ?? '';
    try {
        if ($action === 'preview') {
            $diff = $publisher->previewDiff();
        } elseif ($action === 'publish') {
            $result = $publisher->publish();
            $diff = $publisher->previewDiff();
        }
    } catch (Throwable $e) {
        $error = $e->getMessage();
    }
}

$owner = $config['github']['owner'] ?? '';
$repo = $config['github']['repo'] ?? '';
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Publish to GitHub</title>
  <link rel="stylesheet" href="assets/admin.css" />
</head>
<body>
  <header class="top">
    <a href="index.php">← Dashboard</a>
    <strong>Publish</strong>
  </header>
  <main class="wrap narrow">
    <p class="muted">
      Writes <code>content/projects/&lt;slug&gt;.json</code> via the GitHub Contents API.
      Canonical field name is <code>order</code> (from MySQL <code>display_order</code>).
      Mode: <code><?= h($config['github']['publish_mode'] ?? 'direct') ?></code>
    </p>

    <?php if ($error): ?><p class="error"><?= h($error) ?></p><?php endif; ?>

    <?php if ($result): ?>
      <p class="flash">
        <?= h($result['message']) ?> —
        <?php if ($result['sha']): ?>
          <a href="https://github.com/<?= h($owner) ?>/<?= h($repo) ?>/commit/<?= h($result['sha']) ?>" target="_blank" rel="noopener">
            commit <?= h(substr($result['sha'], 0, 7)) ?>
          </a>
        <?php endif; ?>
      </p>
    <?php endif; ?>

    <?php if ($diff): ?>
      <section class="card">
        <h2>Preview diff</h2>
        <p><strong>Added:</strong> <?= $diff['added'] ? h(implode(', ', $diff['added'])) : '—' ?></p>
        <p><strong>Changed:</strong> <?= $diff['changed'] ? h(implode(', ', $diff['changed'])) : '—' ?></p>
        <p><strong>Removed:</strong> <?= $diff['removed'] ? h(implode(', ', $diff['removed'])) : '—' ?></p>
      </section>
    <?php endif; ?>

    <form method="post" class="row-actions">
      <input type="hidden" name="_csrf" value="<?= h($auth->csrfToken()) ?>" />
      <button type="submit" name="action" value="preview">Refresh preview</button>
      <button type="submit" name="action" value="publish" class="primary"
        onclick="return confirm('Publish current DB state to GitHub?');">
        Publish changes
      </button>
    </form>
  </main>
</body>
</html>
