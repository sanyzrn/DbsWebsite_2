<?php
/**
 * Public, non-secret snapshot. Scheduled publishers read the current key from
 * GitHub cursor-dev; this deployed snapshot is for diagnostics only.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('X-Content-Type-Options: nosniff');
$file = __DIR__ . '/public-key.json';
if (!is_file($file)) {
    http_response_code(503);
    echo '{"error":"public_key_snapshot_missing"}';
    exit;
}
$json = json_decode((string) file_get_contents($file), true);
if (!is_array($json) || ($json['version'] ?? '') !== 'DBS-IDEA-V1' || !is_string($json['public_key_base64'] ?? null)) {
    http_response_code(503);
    echo '{"error":"public_key_snapshot_invalid"}';
    exit;
}
echo json_encode($json, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
