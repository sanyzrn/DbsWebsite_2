<?php
declare(strict_types=1);

use Admin\Auth;
use Admin\Database;
use Admin\GitHubPublisher;
use Admin\ImageHandler;
use Admin\ProjectRepository;

$config = require dirname(__DIR__) . '/config/config.php';

// Force HTTPS for the admin area (webserver redirect is also recommended).
if (
    PHP_SAPI !== 'cli'
    && (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off')
    && ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') !== 'https'
) {
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $uri = $_SERVER['REQUEST_URI'] ?? '/';
    header('Location: https://' . $host . $uri, true, 301);
    exit;
}

spl_autoload_register(static function (string $class): void {
    if (!str_starts_with($class, 'Admin\\')) {
        return;
    }
    $file = dirname(__DIR__) . '/src/' . substr($class, 6) . '.php';
    if (is_readable($file)) {
        require $file;
    }
});

$pdo = Database::pdo($config['db']);
$auth = new Auth($pdo, $config['session_name']);
$auth->startSession();
$projects = new ProjectRepository($pdo);
$images = new ImageHandler($config['uploads_dir'], $config['image_public_base']);
$publisher = new GitHubPublisher($config['github'], $projects, $config['vercel_deploy_hook'] ?: null);

function h(?string $s): string
{
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function lines_to_array(string $text): array
{
    $lines = preg_split('/\R/', $text) ?: [];
    return array_values(array_filter(array_map('trim', $lines), static fn($l) => $l !== ''));
}

function array_to_lines(?array $items): string
{
    return implode("\n", $items ?? []);
}

function require_csrf(Auth $auth): void
{
    $token = $_POST['_csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
    if (!$auth->validateCsrf(is_string($token) ? $token : null)) {
        http_response_code(403);
        exit('Invalid CSRF token.');
    }
}
