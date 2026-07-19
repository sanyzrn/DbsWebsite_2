<?php
declare(strict_types=1);

namespace Admin;

use PDO;
use InvalidArgumentException;

final class ProjectRepository
{
    public function __construct(private PDO $pdo) {}

    public function all(): array
    {
        $stmt = $this->pdo->query('SELECT * FROM projects ORDER BY display_order ASC, id ASC');
        return array_map([$this, 'hydrate'], $stmt->fetchAll());
    }

    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM projects WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? $this->hydrate($row) : null;
    }

    public function findBySlug(string $slug): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM projects WHERE slug = ?');
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        return $row ? $this->hydrate($row) : null;
    }

    public function create(array $data): int
    {
        $this->validate($data);
        $sql = 'INSERT INTO projects (
            slug, status, featured, display_order,
            name_fa, name_en, subtitle_fa, subtitle_en, desc_fa, desc_en,
            problem_fa, problem_en, approach_fa, approach_en, result_fa, result_en,
            role_fa, role_en, tech, tags, image_url, mock, caps_fa, caps_en
        ) VALUES (
            :slug, :status, :featured, :display_order,
            :name_fa, :name_en, :subtitle_fa, :subtitle_en, :desc_fa, :desc_en,
            :problem_fa, :problem_en, :approach_fa, :approach_en, :result_fa, :result_en,
            :role_fa, :role_en, :tech, :tags, :image_url, :mock, :caps_fa, :caps_en
        )';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($this->bind($data));
        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, array $data): void
    {
        $this->validate($data, $id);
        $sql = 'UPDATE projects SET
            slug = :slug, status = :status, featured = :featured, display_order = :display_order,
            name_fa = :name_fa, name_en = :name_en, subtitle_fa = :subtitle_fa, subtitle_en = :subtitle_en,
            desc_fa = :desc_fa, desc_en = :desc_en,
            problem_fa = :problem_fa, problem_en = :problem_en,
            approach_fa = :approach_fa, approach_en = :approach_en,
            result_fa = :result_fa, result_en = :result_en,
            role_fa = :role_fa, role_en = :role_en, tech = :tech, tags = :tags,
            image_url = :image_url, mock = :mock, caps_fa = :caps_fa, caps_en = :caps_en
          WHERE id = :id';
        $params = $this->bind($data);
        $params['id'] = $id;
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
    }

    public function delete(int $id): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM projects WHERE id = ?');
        $stmt->execute([$id]);
    }

    public function setFeatured(int $id, bool $featured): void
    {
        $stmt = $this->pdo->prepare('UPDATE projects SET featured = ? WHERE id = ?');
        $stmt->execute([$featured ? 1 : 0, $id]);
    }

    public function setOrder(int $id, int $order): void
    {
        $stmt = $this->pdo->prepare('UPDATE projects SET display_order = ? WHERE id = ?');
        $stmt->execute([$order, $id]);
    }

    public function setPublishedSha(int $id, string $sha): void
    {
        $stmt = $this->pdo->prepare('UPDATE projects SET published_sha = ? WHERE id = ?');
        $stmt->execute([$sha, $id]);
    }

    public function setImageUrl(int $id, string $url): void
    {
        $stmt = $this->pdo->prepare('UPDATE projects SET image_url = ? WHERE id = ?');
        $stmt->execute([$url, $id]);
    }

    /** Map DB row → content/projects JSON shape (canonical `order`). */
    public function toContentJson(array $project): array
    {
        $out = [
            'id' => $project['slug'],
            'slug' => $project['slug'],
            'status' => $project['status'],
            'featured' => (bool) $project['featured'],
            'order' => (int) $project['display_order'],
            'name' => ['fa' => $project['name_fa'], 'en' => $project['name_en']],
            'subtitle' => ['fa' => (string) $project['subtitle_fa'], 'en' => (string) $project['subtitle_en']],
            'desc' => ['fa' => (string) $project['desc_fa'], 'en' => (string) $project['desc_en']],
            'problem' => ['fa' => (string) $project['problem_fa'], 'en' => (string) $project['problem_en']],
            'approach' => ['fa' => (string) $project['approach_fa'], 'en' => (string) $project['approach_en']],
            'result' => ['fa' => (string) $project['result_fa'], 'en' => (string) $project['result_en']],
            'role' => [
                'fa' => $project['role_fa'] ?? [],
                'en' => $project['role_en'] ?? [],
            ],
            'tech' => $project['tech'] ?? [],
            'tags' => $project['tags'] ?? [],
            'image_url' => $project['image_url'] ?: null,
            'updatedAt' => !empty($project['updated_at'])
                ? substr((string) $project['updated_at'], 0, 10)
                : date('Y-m-d'),
        ];
        if (!empty($project['mock'])) {
            $out['mock'] = $project['mock'];
        }
        if (!empty($project['caps_fa']) || !empty($project['caps_en'])) {
            $out['caps'] = [
                'fa' => $project['caps_fa'] ?? [],
                'en' => $project['caps_en'] ?? [],
            ];
        }
        return $out;
    }

    private function hydrate(array $row): array
    {
        foreach (['role_fa', 'role_en', 'tech', 'tags', 'caps_fa', 'caps_en'] as $jsonCol) {
            if (isset($row[$jsonCol]) && is_string($row[$jsonCol])) {
                $decoded = json_decode($row[$jsonCol], true);
                $row[$jsonCol] = is_array($decoded) ? $decoded : [];
            }
        }
        $row['featured'] = (bool) $row['featured'];
        $row['display_order'] = (int) $row['display_order'];
        return $row;
    }

    private function bind(array $data): array
    {
        return [
            'slug' => $data['slug'],
            'status' => $data['status'],
            'featured' => !empty($data['featured']) ? 1 : 0,
            'display_order' => (int) ($data['display_order'] ?? 0),
            'name_fa' => $data['name_fa'],
            'name_en' => $data['name_en'],
            'subtitle_fa' => $data['subtitle_fa'] ?? '',
            'subtitle_en' => $data['subtitle_en'] ?? '',
            'desc_fa' => $data['desc_fa'] ?? '',
            'desc_en' => $data['desc_en'] ?? '',
            'problem_fa' => $data['problem_fa'] ?? '',
            'problem_en' => $data['problem_en'] ?? '',
            'approach_fa' => $data['approach_fa'] ?? '',
            'approach_en' => $data['approach_en'] ?? '',
            'result_fa' => $data['result_fa'] ?? '',
            'result_en' => $data['result_en'] ?? '',
            'role_fa' => json_encode(array_values($data['role_fa'] ?? []), JSON_UNESCAPED_UNICODE),
            'role_en' => json_encode(array_values($data['role_en'] ?? []), JSON_UNESCAPED_UNICODE),
            'tech' => json_encode(array_values($data['tech'] ?? []), JSON_UNESCAPED_UNICODE),
            'tags' => json_encode(array_values($data['tags'] ?? []), JSON_UNESCAPED_UNICODE),
            'image_url' => $data['image_url'] ?? null,
            'mock' => $data['mock'] ?: null,
            'caps_fa' => json_encode(array_values($data['caps_fa'] ?? []), JSON_UNESCAPED_UNICODE),
            'caps_en' => json_encode(array_values($data['caps_en'] ?? []), JSON_UNESCAPED_UNICODE),
        ];
    }

    private function validate(array $data, ?int $excludeId = null): void
    {
        $errors = [];
        $slug = $data['slug'] ?? '';
        if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            $errors['slug'] = 'Slug must be lowercase alphanumeric with hyphens only.';
        }
        if (trim((string) ($data['name_fa'] ?? '')) === '') {
            $errors['name_fa'] = 'Persian name is required.';
        }
        if (trim((string) ($data['name_en'] ?? '')) === '') {
            $errors['name_en'] = 'English name is required.';
        }
        if (!in_array($data['status'] ?? '', ['production', 'concept'], true)) {
            $errors['status'] = 'Status must be production or concept.';
        }
        foreach (['role_fa', 'role_en', 'tech', 'tags'] as $list) {
            if (isset($data[$list]) && !is_array($data[$list])) {
                $errors[$list] = 'Must be a list.';
            }
        }
        if ($errors) {
            throw new InvalidArgumentException(json_encode($errors, JSON_UNESCAPED_UNICODE));
        }

        $sql = 'SELECT id FROM projects WHERE slug = ?';
        $params = [$slug];
        if ($excludeId !== null) {
            $sql .= ' AND id != ?';
            $params[] = $excludeId;
        }
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        if ($stmt->fetch()) {
            throw new InvalidArgumentException(json_encode(['slug' => 'Slug already exists.'], JSON_UNESCAPED_UNICODE));
        }
    }
}
