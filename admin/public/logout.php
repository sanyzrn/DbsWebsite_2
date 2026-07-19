<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
$auth->requireLogin();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf($auth);
}
$auth->logout();
header('Location: login.php');
exit;
