<?php
declare(strict_types=1);

namespace Admin;

use RuntimeException;

/**
 * Publishes projects table → content/projects/<slug>.json via GitHub Contents API.
 * Canonical JSON field: `order` (maps from MySQL display_order).
 */
final class GitHubPublisher
{
    public function __construct(
        private array $githubCfg,
        private ProjectRepository $projects,
        private ?string $vercelHook = null,
    ) {}

    public function previewDiff(): array
    {
        $local = [];
        foreach ($this->projects->all() as $p) {
            $local[$p['slug']] = $this->projects->toContentJson($p);
        }

        $remoteSlugs = $this->listRemoteProjectSlugs();
        $added = array_values(array_diff(array_keys($local), $remoteSlugs));
        $removed = array_values(array_diff($remoteSlugs, array_keys($local)));
        $changed = [];

        foreach ($local as $slug => $json) {
            if (in_array($slug, $added, true)) {
                continue;
            }
            $remote = $this->getFileJson("content/projects/{$slug}.json");
            if ($remote === null || $this->normalize($remote) !== $this->normalize($json)) {
                $changed[] = $slug;
            }
        }

        return compact('added', 'removed', 'changed');
    }

    /** @return array{sha:string,message:string,mode:string} */
    public function publish(): array
    {
        $token = $this->githubCfg['token'] ?? '';
        if ($token === '') {
            throw new RuntimeException('GITHUB_TOKEN is not configured.');
        }

        $diff = $this->previewDiff();
        $branch = ($this->githubCfg['publish_mode'] ?? 'direct') === 'pull-request'
            ? ($this->githubCfg['content_branch'] ?: 'content-update')
            : ($this->githubCfg['branch'] ?: 'main');

        if (($this->githubCfg['publish_mode'] ?? 'direct') === 'pull-request') {
            $this->ensureBranch($branch, $this->githubCfg['branch'] ?: 'main');
        }

        $lastSha = '';
        foreach ($this->projects->all() as $p) {
            $path = "content/projects/{$p['slug']}.json";
            $body = json_encode($this->projects->toContentJson($p), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
            $lastSha = $this->putFile($path, $body, "content: update {$p['slug']}", $branch);
            $this->projects->setPublishedSha((int) $p['id'], $lastSha);
        }

        foreach ($diff['removed'] as $slug) {
            $lastSha = $this->deleteFile("content/projects/{$slug}.json", "content: remove {$slug}", $branch) ?: $lastSha;
        }

        if (($this->githubCfg['publish_mode'] ?? 'direct') === 'pull-request') {
            $this->ensurePullRequest($branch, $this->githubCfg['branch'] ?: 'main');
        }

        if ($this->vercelHook) {
            $this->http('POST', $this->vercelHook, null, false);
        }

        return [
            'sha' => $lastSha,
            'message' => 'Published successfully',
            'mode' => $this->githubCfg['publish_mode'] ?? 'direct',
        ];
    }

    private function normalize(array $data): string
    {
        return json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    private function apiBase(): string
    {
        return sprintf(
            'https://api.github.com/repos/%s/%s',
            rawurlencode($this->githubCfg['owner']),
            rawurlencode($this->githubCfg['repo'])
        );
    }

    private function headers(): array
    {
        return [
            'Authorization: Bearer ' . $this->githubCfg['token'],
            'Accept: application/vnd.github+json',
            'X-GitHub-Api-Version: 2022-11-28',
            'User-Agent: SaeedZarrini-PortfolioAdmin',
            'Content-Type: application/json',
        ];
    }

    private function http(string $method, string $url, ?array $payload = null, bool $github = true): array
    {
        $ch = curl_init($url);
        $headers = $github ? $this->headers() : ['User-Agent: SaeedZarrini-PortfolioAdmin'];
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 60,
        ]);
        if ($payload !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        }
        $raw = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($raw === false) {
            throw new RuntimeException('HTTP error: ' . curl_error($ch));
        }
        curl_close($ch);
        $json = json_decode($raw, true);
        if ($code >= 400) {
            $msg = is_array($json) ? ($json['message'] ?? $raw) : $raw;
            throw new RuntimeException("GitHub API $code: $msg");
        }
        return is_array($json) ? $json : [];
    }

    private function getFileJson(string $path): ?array
    {
        $url = $this->apiBase() . '/contents/' . implode('/', array_map('rawurlencode', explode('/', $path)))
            . '?ref=' . rawurlencode($this->githubCfg['branch'] ?: 'main');
        try {
            $res = $this->http('GET', $url);
        } catch (RuntimeException $e) {
            if (str_contains($e->getMessage(), '404')) {
                return null;
            }
            throw $e;
        }
        if (empty($res['content'])) {
            return null;
        }
        $decoded = json_decode(base64_decode(str_replace("\n", '', $res['content'])), true);
        return is_array($decoded) ? $decoded : null;
    }

    private function getFileSha(string $path, string $branch): ?string
    {
        $url = $this->apiBase() . '/contents/' . implode('/', array_map('rawurlencode', explode('/', $path)))
            . '?ref=' . rawurlencode($branch);
        try {
            $res = $this->http('GET', $url);
            return $res['sha'] ?? null;
        } catch (RuntimeException $e) {
            if (str_contains($e->getMessage(), '404')) {
                return null;
            }
            throw $e;
        }
    }

    private function putFile(string $path, string $content, string $message, string $branch): string
    {
        $payload = [
            'message' => $message,
            'content' => base64_encode($content),
            'branch' => $branch,
        ];
        $sha = $this->getFileSha($path, $branch);
        if ($sha) {
            $payload['sha'] = $sha;
        }
        $url = $this->apiBase() . '/contents/' . implode('/', array_map('rawurlencode', explode('/', $path)));
        $res = $this->http('PUT', $url, $payload);
        return (string) ($res['commit']['sha'] ?? $res['content']['sha'] ?? '');
    }

    private function deleteFile(string $path, string $message, string $branch): ?string
    {
        $sha = $this->getFileSha($path, $branch);
        if (!$sha) {
            return null;
        }
        $url = $this->apiBase() . '/contents/' . implode('/', array_map('rawurlencode', explode('/', $path)));
        $res = $this->http('DELETE', $url, [
            'message' => $message,
            'sha' => $sha,
            'branch' => $branch,
        ]);
        return (string) ($res['commit']['sha'] ?? '');
    }

    private function listRemoteProjectSlugs(): array
    {
        $url = $this->apiBase() . '/contents/content/projects?ref=' . rawurlencode($this->githubCfg['branch'] ?: 'main');
        try {
            $res = $this->http('GET', $url);
        } catch (RuntimeException $e) {
            if (str_contains($e->getMessage(), '404')) {
                return [];
            }
            throw $e;
        }
        $slugs = [];
        foreach ($res as $item) {
            if (($item['type'] ?? '') === 'file' && str_ends_with($item['name'] ?? '', '.json')) {
                $slugs[] = basename($item['name'], '.json');
            }
        }
        return $slugs;
    }

    private function ensureBranch(string $newBranch, string $fromBranch): void
    {
        $refUrl = $this->apiBase() . '/git/ref/heads/' . rawurlencode($fromBranch);
        $ref = $this->http('GET', $refUrl);
        $sha = $ref['object']['sha'] ?? null;
        if (!$sha) {
            throw new RuntimeException("Could not resolve branch $fromBranch");
        }
        try {
            $this->http('GET', $this->apiBase() . '/git/ref/heads/' . rawurlencode($newBranch));
        } catch (RuntimeException $e) {
            $this->http('POST', $this->apiBase() . '/git/refs', [
                'ref' => "refs/heads/$newBranch",
                'sha' => $sha,
            ]);
        }
    }

    private function ensurePullRequest(string $head, string $base): void
    {
        $list = $this->http(
            'GET',
            $this->apiBase() . '/pulls?state=open&head=' . rawurlencode($this->githubCfg['owner'] . ':' . $head)
        );
        if (!empty($list)) {
            return;
        }
        $this->http('POST', $this->apiBase() . '/pulls', [
            'title' => 'Content update from admin panel',
            'head' => $head,
            'base' => $base,
            'body' => 'Automated content publish from the PHP admin panel.',
        ]);
    }
}
