<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// Only accept POST.
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

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'invalid_json']);
  exit;
}

// Honeypot: field name matches ContactForm.tsx (`website`).
if (!empty($data['website'] ?? '')) {
  http_response_code(200); // pretend success — do not reveal the honeypot
  echo json_encode(['ok' => true]);
  exit;
}

// Timing check: matches client SUBMIT_MIN_MS (2000).
$elapsedMs = (int) ($data['elapsedMs'] ?? 0);
if ($elapsedMs > 0 && $elapsedMs < 2000) {
  http_response_code(200);
  echo json_encode(['ok' => true]);
  exit;
}

$name = trim((string) ($data['name'] ?? ''));
$email = trim((string) ($data['email'] ?? ''));
$message = trim((string) ($data['message'] ?? ''));
$type = trim((string) ($data['type'] ?? ''));
$company = trim((string) ($data['company'] ?? ''));
$budget = trim((string) ($data['budget'] ?? ''));
$timeline = trim((string) ($data['timeline'] ?? ''));

if ($name === '' || $email === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'validation_failed']);
  exit;
}

// Per-IP rate limit: max 5 submissions / hour (flat file, no DB).
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/contact_rate_' . md5($ip) . '.json';
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
  'New contact form submission',
  "Name: {$name}",
  "Email: {$email}",
];
if ($company !== '') {
  $lines[] = "Company: {$company}";
}
if ($type !== '') {
  $lines[] = "Project type: {$type}";
}
if ($budget !== '') {
  $lines[] = "Budget: {$budget}";
}
if ($timeline !== '') {
  $lines[] = "Timeline: {$timeline}";
}
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
  // Server-side diagnostics only — never expose details to the client.
  $logFile = __DIR__ . '/contact-debug.log';
  if ($response === false) {
    error_log(
      date('c') . " | curl_exec returned false — likely network/DNS/TLS-level failure, not an API-level rejection\n",
      3,
      $logFile
    );
  }
  $logLine = date('c') . " | httpCode={$httpCode} | curlErrno={$curlErrno} | " .
    "curlError={$curlError} | baleResponse=" . substr((string) $response, 0, 500) .
    "\n";
  error_log($logLine, 3, $logFile);

  http_response_code(502);
  echo json_encode(['ok' => false, 'error' => 'bale_delivery_failed']);
  exit;
}

echo json_encode(['ok' => true]);
