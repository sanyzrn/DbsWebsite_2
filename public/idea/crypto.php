<?php
/**
 * Idea publishing key derivation.
 * Uses an existing SERVER-SIDE Actions secret also provisioned in /api/bale-config.php.
 * The public half is safe to expose. Never expose the seed or private key.
 */
declare(strict_types=1);

function ideaBoxKeypair(): string {
    $config = dirname(__DIR__) . '/api/bale-config.php';
    if (!is_file($config) || !function_exists('sodium_crypto_box_seed_keypair')) {
        throw new RuntimeException('Idea key service unavailable');
    }
    require_once $config;
    if (!defined('BALE_BOT_TOKEN') || strlen((string)BALE_BOT_TOKEN) < 15) {
        throw new RuntimeException('Idea key unavailable');
    }
    $seed = hash_hkdf('sha256', (string)BALE_BOT_TOKEN, SODIUM_CRYPTO_BOX_SEEDBYTES, 'dbsstudio.idea.sealed-box.v1');
    try {
        return sodium_crypto_box_seed_keypair($seed);
    } finally {
        sodium_memzero($seed);
    }
}
