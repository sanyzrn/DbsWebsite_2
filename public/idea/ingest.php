<?php
/**
 * Signed, sealed automated ingestion. GitHub Actions signs opaque ciphertext with
 * a secret never exposed in the public repository. No plaintext idea passes via
 * GitHub Issues or Actions logs. Decryption happens only on the actual PHP host.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: private, no-store, max-age=0');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('X-Content-Type-Options: nosniff');

function failIngest(int $status, string $error): never {
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $error]);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') failIngest(405, 'method_not_allowed');
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 45000) failIngest(413, 'payload_too_large');
$raw = file_get_contents('php://input', false, null, 0, 45001);
if ($raw === false || strlen($raw) > 45000) failIngest(413, 'payload_too_large');
$json = json_decode($raw, true);
$envelope = is_array($json) ? ($json['envelope'] ?? null) : null;
$signature = $_SERVER['HTTP_X_IDEA_SIGNATURE'] ?? '';
if (!is_string($envelope) || !preg_match('/^DBS-IDEA-V1:([A-Za-z0-9+\/=]{50,40000})$/D', $envelope, $match)) failIngest(400, 'invalid_envelope');
if (!is_string($signature) || !preg_match('/^[a-f0-9]{64}$/D', $signature)) failIngest(401, 'unauthorized');
try {
    require_once __DIR__ . '/crypto.php';
    require_once __DIR__ . '/storage.php';
    $pair = ideaBoxKeypair();
    $expected = hash_hmac('sha256', $envelope, (string) BALE_BOT_TOKEN);
    if (!hash_equals($expected, $signature)) failIngest(401, 'unauthorized');
    $ciphertext = base64_decode($match[1], true);
    if ($ciphertext === false || strlen($ciphertext) > 30000) failIngest(400, 'invalid_ciphertext');
    $plaintext = sodium_crypto_box_seal_open($ciphertext, $pair);
    sodium_memzero($pair);
    if ($plaintext === false) failIngest(400, 'decryption_failed');
    $item = json_decode($plaintext, true);
    sodium_memzero($plaintext);
    if (!is_array($item)) failIngest(400, 'invalid_idea');
    $fields = ['title','category','audience','problem','evidence','product','pricing','mvp','risk','acquisition','validation','notes'];
    $idea = [];
    foreach ($fields as $field) {
        $value = $item[$field] ?? '';
        if (!is_string($value) || mb_strlen($value) > ($field === 'evidence' ? 5000 : 2500)) failIngest(400, 'invalid_field');
        $idea[$field] = trim($value);
    }
    if (in_array('', [$idea['title'],$idea['category'],$idea['audience'],$idea['problem']], true)) failIngest(400, 'required_fields');
    $date = $item['date'] ?? '';
    if (!is_string($date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/D', $date) || !checkdate((int)substr($date,5,2), (int)substr($date,8,2), (int)substr($date,0,4))) failIngest(400, 'invalid_date');
    $metrics = ['demand','differentiation','build','reach','revenue','scale'];
    $scores = [];
    foreach ($metrics as $metric) {
        $n = $item['scores'][$metric] ?? null;
        if (!is_int($n) || $n < 0 || $n > 10) failIngest(400, 'invalid_scores');
        $scores[$metric] = $n;
    }
    $idea['date'] = $date;
    $idea['scores'] = $scores;
    $idea['score'] = round(array_sum($scores) / count($scores), 1);
    $idea['id'] = hash('sha256', $date . '|' . mb_strtolower($idea['title']));
    $idea['added_at'] = date('c');
    if (!ideaStoreItem($idea)) {
        // Treat exact re-delivery as success to make the GitHub publisher idempotent.
        foreach (ideaReadItems() as $old) {
            if (($old['id'] ?? '') === $idea['id']) {
                echo json_encode(['ok' => true, 'duplicate' => true]);
                exit;
            }
        }
        failIngest(503, 'storage_unavailable');
    }
    echo '{"ok":true,"saved":true}';
} catch (Throwable $e) {
    failIngest(503, 'service_unavailable');
}
