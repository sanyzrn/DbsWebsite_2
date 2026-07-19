<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
$auth->requireLogin();

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'POST required']);
    exit;
}

require_csrf($auth);

$projectId = (int) ($_POST['project_id'] ?? 0);
if (!$projectId || !$projects->find($projectId)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Unknown project']);
    exit;
}

try {
    if (empty($_FILES['image'])) {
        throw new RuntimeException('No image uploaded.');
    }
    $url = $images->processUpload($_FILES['image']);
    $projects->setImageUrl($projectId, $url);
    echo json_encode(['ok' => true, 'url' => $url]);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
