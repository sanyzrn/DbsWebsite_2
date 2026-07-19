<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if ($auth->check()) {
    header('Location: index.php');
    exit;
}

$error = '';
$rateLimited = $auth->isRateLimited($auth->clientIp());

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf($auth);
    if ($auth->isRateLimited($auth->clientIp())) {
        http_response_code(429);
        $error = 'Too many failed attempts. Try again in 15 minutes.';
        $rateLimited = true;
    } else {
        $user = trim((string) ($_POST['username'] ?? ''));
        $pass = (string) ($_POST['password'] ?? '');
        if ($auth->attempt($user, $pass)) {
            header('Location: index.php');
            exit;
        }
        $error = 'Invalid username or password.';
        $rateLimited = $auth->isRateLimited($auth->clientIp());
    }
}
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Admin login</title>
  <link rel="stylesheet" href="assets/admin.css" />
</head>
<body class="auth">
  <form method="post" class="card login-card">
    <h1>Projects admin</h1>
    <p class="muted">Single-operator panel — no public registration.</p>
    <?php if ($error): ?><p class="error"><?= h($error) ?></p><?php endif; ?>
    <input type="hidden" name="_csrf" value="<?= h($auth->csrfToken()) ?>" />
    <label>Username<input name="username" autocomplete="username" required <?= $rateLimited ? 'disabled' : '' ?> /></label>
    <label>Password<input type="password" name="password" autocomplete="current-password" required <?= $rateLimited ? 'disabled' : '' ?> /></label>
    <button type="submit" <?= $rateLimited ? 'disabled' : '' ?>>Sign in</button>
  </form>
</body>
</html>
