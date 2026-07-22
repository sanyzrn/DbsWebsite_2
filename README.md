# Saeed Zarrini — portfolio

Personal portfolio site for Saeed Zarrini (DBSGraphic). Not a pure client-only SPA:
the public site is a **static-prerendered** React frontend; project and article content
is edited as files in git.

## Architecture

| Piece | Role |
|-------|------|
| **Public frontend** (`src/`, `content/`) | React 19 + Vite + Tailwind. Build prerenders one HTML file per locale route (`scripts/prerender.mjs`) for SEO. UI copy lives in `src/lib/i18n/` (fa/en). |
| **Content** (`content/projects/*.json`, `content/articles/*.mdx`, `content/news/*.json`) | Canonical case studies, Field Notes, and Daily Digest. Validated at build time (`npm run validate:content`). |
| **Admin** (`admin/`) | **Deactivated (standby).** Former PHP + MySQL authoring UI. Kept in the repo for possible reactivation; not the primary editing path and not deployed with the static site. See [`admin/README.md`](./admin/README.md). |
| **Field Notes MCP** (`mcp-fieldnotes/`) | Optional Cloudflare Worker remote MCP server for Claude to read/write `content/articles` + `content/news` via the GitHub Contents API. See [`mcp-fieldnotes/README.md`](./mcp-fieldnotes/README.md). |
| **Hosting** | **Production:** Apache FTP at `https://saeedzarrini.ir` via [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) (runs after CI succeeds on `main`). Host examples and Apache notes live under [`hosting/`](./hosting/README.md). |
| **Publishing flow** | Edit content files in git (or via the Field Notes MCP) → push to `main` → CI → FTP deploy uploads `dist/`. |

Route lists for the app, sitemap, and prerender share [`shared/site-routes.json`](./shared/site-routes.json).

## Content editing

Project content lives in `content/projects/*.json` and is edited directly (the same as
articles in `content/articles/`) — typically by asking Claude Code to make the change and
commit it. The previous PHP/MySQL admin panel (`admin/`) is deactivated/standby; see
[`admin/README.md`](./admin/README.md) for details on reactivating it if ever needed.

Daily Digest items (when any exist) live in `content/news/*.json` — citation-only, with
required `sourceUrl` + `sourceName`.

Field Notes (articles + news) can also be edited through the optional remote MCP Worker in
[`mcp-fieldnotes/`](./mcp-fieldnotes/) when connected to Claude — same GitHub Contents API
write path, commits land on `main`.

### Project images

Before adding a new project image, run
`node scripts/optimize-image.mjs <path-to-raw-image> <project-slug>` to produce a safe,
optimized file to reference in that project's `image_url` field.

```bash
node scripts/optimize-image.mjs ./raw/hero.jpg dbspulse
# → public/images/projects/dbspulse.webp
# set image_url to "/images/projects/dbspulse.webp" in content/projects/dbspulse.json
```

The script validates the file is a real image (via `sharp`, not extension alone), strips
EXIF, caps the longest edge at 2000px, and re-encodes to WebP by default (JPEG/PNG via
`--format=`). This replaces the safety net formerly provided by `admin/src/ImageHandler.php`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Validate content → SEO files → Vite client build → SSR prerender → service worker |
| `npm run preview` | Preview production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run lint` | ESLint (`src/` + `scripts/`) |
| `npm run generate:seo` | Write `public/robots.txt` + `public/sitemap.xml` from `SITE_URL` |
| `npm run check:urls` | Fail if SEO files hardcode a domain other than `SITE_URL` |
| `npm run check:i18n` | Fail if fa/en UI dictionaries diverge in nested keys |
| `npm run validate:content` | Zod-validate project/article/news content; block published placeholder copy |
| `npm run check:dist` | Post-build: internal links, canonical/OG hosts, 404 `noindex`, `og.jpg` is exactly 1200×630 |
| `npm run check:bundle` | Post-build gzip budgets (JS/CSS/HTML/fonts/first-paint) |
| `npm run check:deploy` | Live HTTPS gate: unknown paths → HTTP 404 + noindex |
| `node scripts/optimize-image.mjs <image> <slug>` | Optimize a project image into `public/images/projects/` |

## Deployment

Host-specific rules (404 status, security headers) live in **[`hosting/`](./hosting/README.md)**.

**Production deploy (FTP):** push to `main` → **CI** workflow → on success, **Deploy to hosting** builds with secrets and uploads `./dist/` to the FTP account root (already `public_html`). Live config is Apache `.htaccess` (emitted as `dist/.htaccess` at build time).

`admin/` is **not** included in `dist/` and is **not** uploaded by the static-frontend deploy
pipeline — it is a separate PHP app that would need its own host. Deactivating it as the
primary editing workflow required no changes to CI/deploy workflows.

### Required GitHub Actions secrets

Set these under **Settings → Secrets and variables → Actions**. They are **never** committed to any file in this repo.

| Secret | Value / notes |
|--------|----------------|
| `FTP_SERVER` | `server78i.irwebspace.com` |
| `FTP_USERNAME` | `sany@saeedzarrini.ir` |
| `FTP_PASSWORD` | Current FTP account password |
| `SITE_URL` | `https://saeedzarrini.ir` |
| `VITE_FORMSPREE_ID` | Formspree form id (placeholder secret for when the interactive form is re-enabled; contact UI is currently disabled pending Telegram integration — workflow still passes the env through) |

### `.htaccess` checklist

`npm run build` already writes `dist/.htaccess` (from `hosting/apache.htaccess.example`, with the build CSP nonce). The deploy workflow verifies that file exists before FTP upload so Apache 404 + headers stay present on every deploy.

**After a successful FTP run**, confirm on the live host:

1. `https://saeedzarrini.ir` loads correctly
2. An unknown path returns a **real HTTP 404** (requires `.htaccess` in the web root)
3. Deployed files match a local `SITE_URL=https://saeedzarrini.ir npm run build` `dist/`

### `SITE_URL`

All canonical / social / sitemap URLs are derived from a single environment variable:

```bash
SITE_URL=https://saeedzarrini.ir
```

Copy `.env.example` to `.env` for local overrides (`.env` is gitignored).

| Environment | Typical `SITE_URL` |
|-------------|--------------------|
| **Production (FTP)** | `https://saeedzarrini.ir` (GitHub Actions secret) |
| **Local / preview** | Same production origin, or another HTTPS origin you control for staging checks |

Set `SITE_URL` in GitHub Actions secrets for production FTP builds. Use a different value only when deliberately checking a non-production origin (Open Graph and sitemap URLs follow whatever `SITE_URL` was at build time).

At build time:

1. `generate:seo` writes `robots.txt` and `sitemap.xml` using `SITE_URL` (all fa/en routes + published project slugs)
2. `check:urls` fails the build if those files or `index.html` still contain a different site domain
3. Vite replaces `__SITE_URL__` placeholders in `index.html` and exposes `import.meta.env.VITE_SITE_URL` to the app
4. A build-time prerender step emits one static HTML file per route under `dist/` (title, description, canonical, hreflang, Open Graph, JSON-LD)

Do not hardcode the site domain elsewhere — change `SITE_URL` only.

Before promoting a production build, run:

```bash
SITE_URL=https://saeedzarrini.ir npm run check:deploy
```

(or set `DEPLOY_CHECK_BASE_URL` to another HTTPS origin). This hits the live URL over HTTPS and asserts real HTTP 404 + `noindex` on unknown paths.

### Contact form

Set `VITE_FORMSPREE_ID` for Formspree delivery. Without it, the interactive form is hidden
and visitors see a short direct-email message instead (production builds still succeed with
a warning). The dedicated `/contact` page is the canonical destination; the About-page
modal remains a shortcut.

## License

See [`LICENSE`](./LICENSE) — all rights reserved.
