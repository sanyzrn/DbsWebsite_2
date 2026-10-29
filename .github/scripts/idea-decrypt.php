<?php
/**
 * Decrypt a DBS-IDEA-V1 envelope only inside a privileged GitHub Actions runner.
 * Plaintext is emitted on stdout to the parent process, never to Actions logs.
 */
declare(strict_types=1);
ini_set('display_errors', '0');
$secret = getenv('IDEA_SHARED_SECRET');
$envelope = trim((string) stream_get_contents(STDIN));
if (!is_string($secret) || strlen($secret) < 15 || !function_exists('sodium_crypto_box_seed_keypair')) exit(2);
if (!preg_match('/^DBS-IDEA-V1:([A-Za-z0-9+\/=]{50,40000})$/D', $envelope, $match)) exit(3);
$payload = base64_decode($match[1], true);
if ($payload === false || strlen($payload) > 30000) exit(4);
$seed = hash_hkdf('sha256', $secret, SODIUM_CRYPTO_BOX_SEEDBYTES, 'dbsstudio.idea.sealed-box.v1');
$keypair = sodium_crypto_box_seed_keypair($seed);
sodium_memzero($seed);
$plaintext = sodium_crypto_box_seal_open($payload, $keypair);
sodium_memzero($keypair);
if ($plaintext === false || !is_array(json_decode($plaintext, true))) exit(5);
fwrite(STDOUT, $plaintext);
sodium_memzero($plaintext);
