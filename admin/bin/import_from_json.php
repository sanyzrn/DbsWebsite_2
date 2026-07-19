#!/usr/bin/env php
<?php
declare(strict_types=1);

/**
 * Optional: seed MySQL from existing content/projects/*.json files.
 *
 * Usage (from repo root):
 *   php admin/bin/import_from_json.php
 */

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "CLI only.\n");
    exit(1);
}

require dirname(__DIR__) . '/public/_bootstrap.php';

$dir = dirname(__DIR__, 2) . '/content/projects';
$files = glob($dir . '/*.json') ?: [];
if (!$files) {
    fwrite(STDERR, "No JSON files in $dir\n");
    exit(1);
}

foreach ($files as $file) {
    $raw = json_decode((string) file_get_contents($file), true);
    if (!is_array($raw)) {
        fwrite(STDERR, "Skip invalid: $file\n");
        continue;
    }
    $slug = (string) ($raw['slug'] ?? $raw['id'] ?? '');
    $data = [
        'slug' => $slug,
        'status' => $raw['status'] ?? 'concept',
        'featured' => !empty($raw['featured']),
        'display_order' => (int) ($raw['order'] ?? 0),
        'name_fa' => $raw['name']['fa'] ?? '',
        'name_en' => $raw['name']['en'] ?? '',
        'subtitle_fa' => $raw['subtitle']['fa'] ?? '',
        'subtitle_en' => $raw['subtitle']['en'] ?? '',
        'desc_fa' => $raw['desc']['fa'] ?? '',
        'desc_en' => $raw['desc']['en'] ?? '',
        'problem_fa' => $raw['problem']['fa'] ?? '',
        'problem_en' => $raw['problem']['en'] ?? '',
        'approach_fa' => $raw['approach']['fa'] ?? '',
        'approach_en' => $raw['approach']['en'] ?? '',
        'result_fa' => $raw['result']['fa'] ?? '',
        'result_en' => $raw['result']['en'] ?? '',
        'role_fa' => $raw['role']['fa'] ?? [],
        'role_en' => $raw['role']['en'] ?? [],
        'tech' => $raw['tech'] ?? [],
        'tags' => $raw['tags'] ?? [],
        'image_url' => $raw['image_url'] ?? null,
        'mock' => $raw['mock'] ?? '',
        'caps_fa' => $raw['caps']['fa'] ?? [],
        'caps_en' => $raw['caps']['en'] ?? [],
    ];
    $existing = $projects->findBySlug($slug);
    try {
        if ($existing) {
            $projects->update((int) $existing['id'], $data);
            echo "Updated $slug\n";
        } else {
            $projects->create($data);
            echo "Created $slug\n";
        }
    } catch (Throwable $e) {
        fwrite(STDERR, "Error $slug: {$e->getMessage()}\n");
    }
}
