#!/usr/bin/env php
<?php
declare(strict_types=1);

/**
 * Minimal numbered-SQL migration runner for the admin MySQL schema.
 *
 * Usage:
 *   php admin/bin/migrate.php
 *
 * Applies every admin/sql/migrations/NNN_*.sql file not yet recorded in
 * schema_migrations, in lexical order. Safe to re-run.
 */

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "CLI only.\n");
    exit(1);
}

require dirname(__DIR__) . '/public/_bootstrap.php';

/** @var PDO $pdo */

$pdo->exec(
    'CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
);

$dir = dirname(__DIR__) . '/sql/migrations';
if (!is_dir($dir)) {
    fwrite(STDERR, "Missing migrations directory: {$dir}\n");
    exit(1);
}

$files = array_values(array_filter(
    scandir($dir) ?: [],
    static fn(string $f): bool => (bool) preg_match('/^\d{3}_.+\.sql$/', $f)
));
sort($files, SORT_STRING);

$applied = $pdo->query('SELECT filename FROM schema_migrations')->fetchAll(PDO::FETCH_COLUMN);
$appliedSet = array_fill_keys($applied ?: [], true);

$ran = 0;
foreach ($files as $file) {
    if (isset($appliedSet[$file])) {
        echo "skip  {$file}\n";
        continue;
    }
    $sql = file_get_contents($dir . '/' . $file);
    if ($sql === false || trim($sql) === '') {
        fwrite(STDERR, "Empty migration: {$file}\n");
        exit(1);
    }
    echo "apply {$file}\n";
    $pdo->exec($sql);
    $stmt = $pdo->prepare('INSERT INTO schema_migrations (filename) VALUES (?)');
    $stmt->execute([$file]);
    $ran++;
}

echo $ran === 0 ? "migrate: nothing to apply\n" : "migrate: applied {$ran} migration(s)\n";
