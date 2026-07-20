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
| **Hosting** | Active host today: **Vercel** ([`vercel.json`](./vercel.json); examples under [`hosting/`](./hosting/README.md)). Deploy is git-based (push → host build). Expect the host to change; update `hosting/` + this note when it does. |
| **Publishing flow** | Edit content files in git → push → host auto-deploy builds the static site. |

Route lists for the app, sitemap, and prerender share [`shared/site-routes.json`](./shared/site-routes.json).

## Content editing

Project content lives in `content/projects/*.json` and is edited directly (the same as
articles in `content/articles/`) — typically by asking Claude Code to make the change and
commit it. The previous PHP/MySQL admin panel (`admin/`) is deactivated/standby; see
[`admin/README.md`](./admin/README.md) for details on reactivating it if ever needed.

Daily Digest items (when any exist) live in `content/news/*.json` — citation-only, with
required `sourceUrl` + `sourceName`.

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
| `npm run check:dist` | Post-build: internal links, canonical/OG hosts, 404 `noindex` |
| `npm run check:bundle` | Post-build gzip budgets (JS/CSS/HTML/fonts/first-paint) |
| `npm run check:deploy` | Live HTTPS gate: unknown paths → HTTP 404 + noindex |
| `node scripts/optimize-image.mjs <image> <slug>` | Optimize a project image into `public/images/projects/` |

## Deployment

Host-specific rules (404 status, security headers, temporary-subdomain → canonical redirect) live in **[`hosting/`](./hosting/README.md)**.  
**Active host today: Vercel** — the live file is [`vercel.json`](./vercel.json) at the repo root (mirrored under `hosting/`). When migrating, swap that file for the Netlify / Cloudflare / Nginx example in `hosting/`.

`admin/` is **not** included in `dist/` and is **not** uploaded by the static-frontend deploy
pipeline — it is a separate PHP app that would need its own host. Deactivating it as the
primary editing workflow required no changes to CI/deploy workflows.

### `SITE_URL`

All canonical / social / sitemap URLs are derived from a single environment variable:

```bash
SITE_URL=https://dbsgraphic.ir
```

Copy `.env.example` to `.env` for local overrides (`.env` is gitignored).

| Environment | Typical `SITE_URL` |
|-------------|--------------------|
| **Production** | `https://dbsgraphic.ir` (or your custom domain once live) |
| **Preview / staging** | Your preview host, e.g. `https://your-app.vercel.app` |

Set `SITE_URL` in the host’s environment (Vercel → Project → Settings → Environment Variables). Use different values for Preview vs Production so Open Graph and sitemap URLs match the deployment.

At build time:

1. `generate:seo` writes `robots.txt` and `sitemap.xml` using `SITE_URL` (all fa/en routes + published project slugs)
2. `check:urls` fails the build if those files or `index.html` still contain a different site domain
3. Vite replaces `__SITE_URL__` placeholders in `index.html` and exposes `import.meta.env.VITE_SITE_URL` to the app
4. A build-time prerender step emits one static HTML file per route under `dist/` (title, description, canonical, hreflang, Open Graph, JSON-LD)

Do not hardcode the site domain elsewhere — change `SITE_URL` only.

Before promoting a production build, run:

```bash
SITE_URL=https://dbsgraphic.ir npm run check:deploy
```

(or set `DEPLOY_CHECK_BASE_URL` to a preview origin). This hits the live URL over HTTPS and asserts real HTTP 404 + `noindex` on unknown paths.

### Contact form

Set `VITE_FORMSPREE_ID` for Formspree delivery. Without it, the interactive form is hidden
and visitors see a short direct-email message instead (production builds still succeed with
a warning). The dedicated `/contact` page is the canonical destination; the About-page
modal remains a shortcut.

## License

See [`LICENSE`](./LICENSE) — all rights reserved.
