<?php
declare(strict_types=1);

/**
 * Minimal .env loader — no Composer required.
 * Existing getenv/$_ENV values win over file values.
 */
function load_env_file(string $path): void
{
    if (!is_readable($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (!str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if (
            (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            $value = substr($value, 1, -1);
        }
        if (getenv($key) === false) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

load_env_file(dirname(__DIR__) . '/config/.env');

function env(string $key, ?string $default = null): ?string
{
    $v = $_ENV[$key] ?? getenv($key);
    if ($v === false || $v === null || $v === '') {
        return $default;
    }
    return (string) $v;
}

return [
    'db' => [
        'host' => env('DB_HOST', '127.0.0.1'),
        'port' => (int) env('DB_PORT', '3306'),
        'name' => env('DB_NAME', 'portfolio_admin'),
        'user' => env('DB_USER', 'portfolio'),
        'pass' => env('DB_PASS', ''),
    ],
    'github' => [
        'token' => env('GITHUB_TOKEN', ''),
        'owner' => env('GITHUB_OWNER', ''),
        'repo' => env('GITHUB_REPO', ''),
        'branch' => env('GITHUB_BRANCH', 'main'),
        'content_branch' => env('GITHUB_CONTENT_BRANCH', 'content-update'),
        'publish_mode' => env('PUBLISH_MODE', 'direct'), // direct | pull-request
    ],
    'vercel_deploy_hook' => env('VERCEL_DEPLOY_HOOK_URL', ''),
    'image_public_base' => rtrim(env('IMAGE_PUBLIC_BASE_URL', ''), '/'),
    'uploads_dir' => dirname(__DIR__) . '/uploads',
    'app_url' => rtrim(env('APP_URL', ''), '/'),
    'session_name' => env('SESSION_NAME', 'sz_admin_sess'),
];
