<?php
declare(strict_types=1);

namespace Admin;

use PDO;

final class Auth
{
    public function __construct(
        private PDO $pdo,
        private string $sessionName,
    ) {}

    public function startSession(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        session_name($this->sessionName);
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        session_start();
    }

    public function csrfToken(): string
    {
        if (empty($_SESSION['_csrf'])) {
            $_SESSION['_csrf'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['_csrf'];
    }

    public function validateCsrf(?string $token): bool
    {
        return is_string($token)
            && isset($_SESSION['_csrf'])
            && hash_equals($_SESSION['_csrf'], $token);
    }

    public function check(): bool
    {
        return !empty($_SESSION['admin_user_id']);
    }

    public function requireLogin(): void
    {
        if (!$this->check()) {
            header('Location: login.php');
            exit;
        }
    }

    public function clientIp(): string
    {
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    public function isRateLimited(string $ip): bool
    {
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) FROM login_attempts
             WHERE ip_address = ? AND success = 0
               AND attempted_at > (NOW() - INTERVAL 15 MINUTE)'
        );
        $stmt->execute([$ip]);
        return (int) $stmt->fetchColumn() >= 5;
    }

    public function logAttempt(string $username, string $ip, bool $success): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO login_attempts (username, ip_address, success) VALUES (?, ?, ?)'
        );
        $stmt->execute([$username, $ip, $success ? 1 : 0]);
    }

    public function attempt(string $username, string $password): bool
    {
        $ip = $this->clientIp();
        if ($this->isRateLimited($ip)) {
            return false;
        }

        $stmt = $this->pdo->prepare('SELECT id, password_hash FROM admin_users WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $row = $stmt->fetch();

        $ok = $row && password_verify($password, $row['password_hash']);
        $this->logAttempt($username, $ip, (bool) $ok);

        if (!$ok) {
            return false;
        }

        session_regenerate_id(true);
        $_SESSION['admin_user_id'] = (int) $row['id'];
        $_SESSION['admin_username'] = $username;
        return true;
    }

    public function logout(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'] ?? '', (bool) $p['secure'], (bool) $p['httponly']);
        }
        session_destroy();
    }
}
