# MCP Field Notes (Cloudflare Worker)

Remote MCP server that gives Claude **read/write** access to this repo’s Field Notes
content (`content/articles/*.mdx` and `content/news/*.json`) via the **GitHub Contents API** —
the same read-sha-then-write publishing approach as the (standby) PHP admin’s
`GitHubPublisher.php`, exposed as MCP tools instead of a web form.

Stack: Cloudflare Workers + Agents SDK `createMcpHandler` (stateless Streamable HTTP —
**no** Durable Objects / KV required) + Zod schemas kept in parity with
`scripts/article-content.mjs` / `scripts/news-content.mjs`.

## Tools

| Tool | Purpose |
|------|---------|
| `list_articles` | List MDX articles (optional `status` filter) |
| `get_article` | Full frontmatter + body for one slug/lang |
| `create_article` | Create a new locale file (`dryRun` supported) |
| `update_article` | Merge-update existing file (`dryRun` supported) |
| `list_news` | List Daily Digest JSON items |
| `create_news_item` | Create news JSON — **requires** `sourceUrl` + `sourceName`; always sets `curatedByAI: true` |
| `update_news_item` | Merge-update news item (same citation rules) |

There is **no** `delete_*` tool in v1 — delete manually on GitHub / via Claude Code.

Every successful write commits straight to `GITHUB_BRANCH` (default `main`), which triggers
the existing CI + static deploy pipeline.

## Secrets (never commit)

Set both secrets on the Worker (and in `.dev.vars` for local `wrangler dev`):

```bash
cd mcp-fieldnotes

# Fine-grained GitHub PAT: Contents Read and write on THIS repo only
npx wrangler secret put GITHUB_TOKEN

# Long random shared secret for MCP clients (e.g. openssl rand -hex 32)
npx wrangler secret put MCP_BEARER_TOKEN
```

Local development:

```bash
cp .dev.vars.example .dev.vars
# edit .dev.vars — fill GITHUB_TOKEN and MCP_BEARER_TOKEN
npm install
npm start
# MCP endpoint: http://localhost:8787/mcp
```

Non-secret repo targeting lives in `wrangler.jsonc` → `vars`:

- `GITHUB_OWNER` (default `sanyzrn`)
- `GITHUB_REPO` (default `DbsWebsite_2`)
- `GITHUB_BRANCH` (default `main`)

## Deploy

```bash
cd mcp-fieldnotes
npm install
npx wrangler deploy
```

Note the resulting URL, e.g.:

```text
https://mcp-fieldnotes.<your-subdomain>.workers.dev/mcp
```

Redeploy after code changes with the same `npx wrangler deploy` (or wire this folder to
Workers Builds / a GitHub Action later — optional).

### Auth on every request

The Worker rejects any `/mcp` request without a valid

```http
Authorization: Bearer <MCP_BEARER_TOKEN>
```

with **401**. This check runs on **every** HTTP hit to `/mcp` (initialize + tool calls), not
only at connection setup. `/` and `/health` are unauthenticated liveness probes and do not
expose tools.

## Connect from claude.ai

claude.ai custom connectors support **static request headers** (beta) for bearer/API-key
servers — you do **not** need OAuth for this Worker.

1. Deploy the Worker and confirm `GET /health` returns ok.
2. Open **claude.ai → Settings → Connectors → Add custom connector**.
3. Paste the MCP URL: `https://mcp-fieldnotes.<subdomain>.workers.dev/mcp`
4. Open **Request headers**, choose **Authorization**, and set the value to:

   ```text
   Bearer <your-MCP_BEARER_TOKEN>
   ```

   (Include the word `Bearer` and a space — Claude sends the value as entered.)
5. Save / connect. Ask Claude to call `list_articles` once to verify auth + GitHub access.

### Claude Desktop / Cursor (local proxy)

If the client only speaks stdio MCP, use `mcp-remote`:

```json
{
  "mcpServers": {
    "fieldnotes": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp-fieldnotes.<subdomain>.workers.dev/mcp",
        "--header",
        "Authorization: Bearer ${MCP_BEARER_TOKEN}"
      ]
    }
  }
}
```

## Manual smoke test

With the Worker running (`npm start` or deployed):

```bash
# Should 401
curl -sS -o /dev/null -w "%{http_code}\n" \
  -X POST http://localhost:8787/mcp \
  -H 'content-type: application/json' \
  -d '{}'

# Should pass auth (MCP protocol response — not a browser page)
curl -sS http://localhost:8787/mcp \
  -H "Authorization: Bearer $MCP_BEARER_TOKEN" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'
```

Then use [MCP Inspector](https://github.com/modelcontextprotocol/inspector) against the same
URL with the Bearer header and invoke `list_articles`.

## Dry runs

`create_article`, `update_article`, `create_news_item`, and `update_news_item` accept
`dryRun: true` — they validate and return the fully assembled file contents **without**
committing. Prefer a dry run before the first real write.

## Validation parity

Schemas in `src/schemas.ts` mirror the Zod shapes in the site build scripts. News items
cannot be written without a real `sourceUrl` + non-empty `sourceName`. MCP create/update
paths always set `curatedByAI: true`.

## Security notes

- Scope the GitHub PAT to **this repository only**, Contents: Read and write.
- Rotate `MCP_BEARER_TOKEN` if it leaks; treat it like a password.
- This Worker can push to `main` — treat tool access as production write access.
