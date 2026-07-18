#!/usr/bin/env php
<?php
declare(strict_types=1);

/**
 * CLI-only admin user bootstrap. No public registration path exists.
 *
 * Usage:
 *   php admin/bin/setup_admin.php --username=saeed --password='…'
 */

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "CLI only.\n");
    exit(1);
}

$opts = getopt('', ['username:', 'password:']);
$username = trim((string) ($opts['username'] ?? ''));
$password = (string) ($opts['password'] ?? '');

if ($username === '' || $password === '') {
    fwrite(STDERR, "Usage: php setup_admin.php --username=... --password=...\n");
    exit(1);
}
if (strlen($password) < 10) {
    fwrite(STDERR, "Password must be at least 10 characters.\n");
    exit(1);
}

require dirname(__DIR__) . '/public/_bootstrap.php';

$hash = password_hash($password, PASSWORD_ARGON2ID);
if ($hash === false) {
    // Fallback if Argon2id unavailable on host
    $hash = password_hash($password, PASSWORD_DEFAULT);
}

$stmt = $pdo->prepare('SELECT id FROM admin_users WHERE username = ?');
$stmt->execute([$username]);
if ($stmt->fetch()) {
    $upd = $pdo->prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?');
    $upd->execute([$hash, $username]);
    echo "Updated password for existing user `$username`.\n";
} else {
    $count = (int) $pdo->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();
    if ($count > 0) {
        fwrite(STDERR, "An admin user already exists. Refusing to create another (single-admin tool).\n");
        exit(1);
    }
    $ins = $pdo->prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)');
    $ins->execute([$username, $hash]);
    echo "Created admin user `$username`.\n";
}
