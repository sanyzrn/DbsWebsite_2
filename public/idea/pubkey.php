<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('X-Content-Type-Options: nosniff');
try {
    require_once __DIR__ . '/crypto.php';
    $pair = ideaBoxKeypair();
    $publicKey = sodium_crypto_box_publickey($pair);
    sodium_memzero($pair);
    echo json_encode([
        'version' => 'DBS-IDEA-V1',
        'algorithm' => 'crypto_box_seal',
        'public_key_base64' => base64_encode($publicKey),
    ], JSON_THROW_ON_ERROR);
} catch (Throwable $e) {
    http_response_code(503);
    echo '{"error":"service_unavailable"}';
}
