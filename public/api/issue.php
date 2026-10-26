<?php
declare(strict_types=1);

/**
 * Problem-report endpoint (/issues). Same transport as contact.php: the report is
 * forwarded to the owner's Bale chat by a server-side bot token and is never stored
 * or shown publicly.
 */

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
  exit;
}

$config = __DIR__ . '/bale-config.php';
if (!file_exists($config)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'not_configured']);
  exit;
}
require $config; // defines BALE_BOT_TOKEN and BALE_CHAT_ID

$raw = file_get_contents('php://input', false, null, 0, 20000);
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'invalid_json']);
  exit;
}

// Honeypot: field name matches IssueForm.tsx (`website`).
if (!empty($data['website'] ?? '')) {
  http_response_code(200); // pretend success — do not reveal the honeypot
  echo json_encode(['ok' => true]);
  exit;
}

// Timing check: matches client SUBMIT_MIN_MS (2000).
$elapsedMs = (int) ($data['elapsedMs'] ?? 0);
if ($elapsedMs < 2000) {
  http_response_code(200);
  echo json_encode(['ok' => true]);
  exit;
}

// Allowed values — keep in sync with ISSUE_PRODUCT_IDS / ISSUE_KIND_IDS in src/lib/i18n/fa.ts.
$products = [
  'nexachatai' => 'NexaChatAI (WordPress plugin)',
  'nex-android' => 'Nex (Android)',
  'nex-windows' => 'Nex (Windows)',
  'nexahr' => 'NexaHR',
  'other' => 'Other',
];
$kinds = [
  'bug' => 'Bug',
  'security' => 'Security issue',
  'suggestion' => 'Suggestion',
  'question' => 'Question',
];

$str = static fn(string $key): string => trim((string) ($data[$key] ?? ''));
$name = $str('name');
$email = $str('email');
$product = $str('product');
$kind = $str('kind');
$version = $str('version');
$environment = $str('environment');
$message = $str('message');

if (
  $name === '' || $email === '' || $message === '' ||
  !filter_var($email, FILTER_VALIDATE_EMAIL) ||
  !isset($products[$product]) || !isset($kinds[$kind])
) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'validation_failed']);
  exit;
}

// Reject oversized fields before building the Bale payload (~4096 char limit).
$maxLen = [
  'name' => 100,
  'email' => 254,
  'version' => 40,
  'environment' => 200,
  'message' => 3000,
];
$values = compact('name', 'email', 'version', 'environment', 'message');
foreach ($maxLen as $field => $limit) {
  if (mb_strlen($values[$field]) > $limit) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'field_too_long', 'field' => $field]);
    exit;
  }
}

// Per-IP rate limit: max 5 reports / hour (flat file, no DB). Separate from the contact form.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/issue_rate_' . md5($ip) . '.json';
$now = time();
$attempts = [];
if (file_exists($rateFile)) {
  $decoded = json_decode((string) file_get_contents($rateFile), true);
  $attempts = is_array($decoded) ? $decoded : [];
  $attempts = array_values(array_filter($attempts, static fn($t) => is_int($t) && ($now - $t) < 3600));
}
if (count($attempts) >= 5) {
  http_response_code(429);
  echo json_encode(['ok' => false, 'error' => 'rate_limited']);
  exit;
}
$attempts[] = $now;
file_put_contents($rateFile, json_encode($attempts));

// Plain text only — no Bale parse_mode / Markdown escaping.
$lines = [
  'New problem report',
  "Product: {$products[$product]}",
  "Type: {$kinds[$kind]}",
];
if ($version !== '') {
  $lines[] = "Version: {$version}";
}
if ($environment !== '') {
  $lines[] = "Environment: {$environment}";
}
$lines[] = "Name: {$name}";
$lines[] = "Email: {$email}";
$lines[] = 'Message:';
$lines[] = $message;
$text = implode("\n", $lines);

$baleUrl = 'https://tapi.bale.ai/bot' . BALE_BOT_TOKEN . '/sendMessage';
$ch = curl_init($baleUrl);
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 10,
  CURLOPT_POSTFIELDS => http_build_query([
    'chat_id' => BALE_CHAT_ID,
    'text' => $text,
  ]),
]);
$response = curl_exec($ch);
$curlErrno = curl_errno($ch);
$curlError = curl_error($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $httpCode !== 200) {
  // Server-side diagnostics only — never expose details to the client. The log lives in
  // the temp dir (outside the web root), like the rate-limit file, and holds no report text.
  $logFile = sys_get_temp_dir() . '/dbswebsite-issue-debug.log';
  error_log(
    date('c') . " | httpCode={$httpCode} | curlErrno={$curlErrno} | curlError={$curlError}" .
    ' | baleResponse=' . substr((string) $response, 0, 300) . "\n",
    3,
    $logFile
  );

  http_response_code(502);
  echo json_encode(['ok' => false, 'error' => 'bale_delivery_failed']);
  exit;
}

echo json_encode(['ok' => true]);
