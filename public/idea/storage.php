<?php
/**
 * Shared private storage for interactive editor and signed automated deliveries.
 * This file is never intended to be requested directly.
 */
declare(strict_types=1);

const IDEA_DATA_FILE = __DIR__ . '/.ideas.php';
const IDEA_LOCK_FILE = __DIR__ . '/.ideas.lock';

function ideaReadItems(): array {
    if (!is_file(IDEA_DATA_FILE)) return [];
    $items = require IDEA_DATA_FILE;
    return is_array($items) ? array_values(array_filter($items, 'is_array')) : [];
}

function ideaStoreItem(array $idea): bool {
    $handle = @fopen(IDEA_LOCK_FILE, 'c');
    if (!$handle || !flock($handle, LOCK_EX)) return false;
    try {
        $items = ideaReadItems();
        foreach ($items as $existing) {
            if (($existing['id'] ?? '') === $idea['id']) return false;
        }
        array_unshift($items, $idea);
        $payload = "<?php\n// Private runtime data; do not commit this file.\nreturn " . var_export($items, true) . ";\n";
        $temp = __DIR__ . '/.ideas-' . bin2hex(random_bytes(10)) . '.php';
        if (@file_put_contents($temp, $payload, LOCK_EX) === false) return false;
        @chmod($temp, 0600);
        if (!@rename($temp, IDEA_DATA_FILE)) {
            @unlink($temp);
            return false;
        }
        @chmod(IDEA_DATA_FILE, 0600);
        return true;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}
