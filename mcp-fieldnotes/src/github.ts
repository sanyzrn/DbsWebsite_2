/**
 * Minimal GitHub Contents API client — same read-sha-then-write pattern as
 * admin/src/GitHubPublisher.php (no local git clone).
 */
import type { Env } from "./env";

function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export type GitHubFile = {
  path: string;
  content: string;
  sha: string;
};

export type PutResult = {
  commitSha: string;
  contentSha: string;
};

export class GitHubContentsError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "GitHubContentsError";
  }
}

export class GitHubClient {
  constructor(private readonly env: Env) {}

  private apiBase(): string {
    return `https://api.github.com/repos/${encodeURIComponent(this.env.GITHUB_OWNER)}/${encodeURIComponent(this.env.GITHUB_REPO)}`;
  }

  private headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "mcp-fieldnotes-worker",
      "Content-Type": "application/json",
    };
  }

  private encodePath(path: string): string {
    return path
      .split("/")
      .map((s) => encodeURIComponent(s))
      .join("/");
  }

  private async request(method: string, url: string, body?: unknown): Promise<unknown> {
    if (!this.env.GITHUB_TOKEN?.trim()) {
      throw new GitHubContentsError("GITHUB_TOKEN is not configured on the Worker.", 500);
    }
    const res = await fetch(url, {
      method,
      headers: this.headers(),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text;
    }
    if (!res.ok) {
      const msg =
        json && typeof json === "object" && json !== null && "message" in json
          ? String((json as { message: unknown }).message)
          : text || res.statusText;
      throw new GitHubContentsError(`GitHub API ${res.status}: ${msg}`, res.status);
    }
    return json;
  }

  /** List files in a directory (non-recursive). Returns [] if missing. */
  async listDirectory(dirPath: string): Promise<Array<{ name: string; path: string; type: string; sha: string }>> {
    const url = `${this.apiBase()}/contents/${this.encodePath(dirPath)}?ref=${encodeURIComponent(this.env.GITHUB_BRANCH)}`;
    try {
      const json = await this.request("GET", url);
      if (!Array.isArray(json)) return [];
      return json.map((item: { name?: string; path?: string; type?: string; sha?: string }) => ({
        name: String(item.name ?? ""),
        path: String(item.path ?? ""),
        type: String(item.type ?? ""),
        sha: String(item.sha ?? ""),
      }));
    } catch (err) {
      if (err instanceof GitHubContentsError && err.status === 404) return [];
      throw err;
    }
  }

  /** Read a file; returns null on 404. */
  async getFile(path: string): Promise<GitHubFile | null> {
    const url = `${this.apiBase()}/contents/${this.encodePath(path)}?ref=${encodeURIComponent(this.env.GITHUB_BRANCH)}`;
    try {
      const json = (await this.request("GET", url)) as {
        content?: string;
        encoding?: string;
        sha?: string;
        path?: string;
      };
      if (!json.content) return null;
      const raw = json.content.replace(/\n/g, "");
      const content = base64ToUtf8(raw);
      return {
        path: String(json.path ?? path),
        content,
        sha: String(json.sha ?? ""),
      };
    } catch (err) {
      if (err instanceof GitHubContentsError && err.status === 404) return null;
      throw err;
    }
  }

  /**
   * Create or update a file. When `sha` is provided, GitHub updates that blob;
   * omit sha to create. Mirrors GitHubPublisher::putFile.
   */
  async putFile(path: string, content: string, message: string, sha?: string | null): Promise<PutResult> {
    const payload: Record<string, string> = {
      message,
      content: utf8ToBase64(content),
      branch: this.env.GITHUB_BRANCH,
    };
    if (sha) payload.sha = sha;

    const url = `${this.apiBase()}/contents/${this.encodePath(path)}`;
    const json = (await this.request("PUT", url, payload)) as {
      commit?: { sha?: string };
      content?: { sha?: string };
    };
    return {
      commitSha: String(json.commit?.sha ?? ""),
      contentSha: String(json.content?.sha ?? ""),
    };
  }
}

export function github(env: Env): GitHubClient {
  return new GitHubClient(env);
}
