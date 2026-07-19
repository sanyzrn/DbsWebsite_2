# Saeed Zarrini — portfolio

Personal portfolio site for Saeed Zarrini (DBSGraphic). Not a pure client-only SPA:
the public site is a **static-prerendered** React frontend; project content is authored
in a separate PHP/MySQL admin and published into git.

## Architecture

| Piece | Role |
|-------|------|
| **Public frontend** (`src/`, `content/projects/*.json`) | React 19 + Vite + Tailwind. Build prerenders one HTML file per locale route (`scripts/prerender.mjs`) for SEO. UI copy lives in `src/lib/i18n/` (fa/en). |
| **Content** (`content/projects/*.json`) | Canonical project case studies. Validated at build time (`npm run validate:content`). |
| **Admin** (`admin/`) | Separate PHP + MySQL authoring UI. Publishes JSON via the GitHub Contents API into this repo. **Not** part of the public runtime — visitors never hit the admin DB. Setup: [`admin/README.md`](./admin/README.md). |
| **Hosting** | Active host today: **Vercel** ([`vercel.json`](./vercel.json); examples under [`hosting/`](./hosting/README.md)). Deploy is git-based (push → host build). Expect the host to change; update `hosting/` + this note when it does. |
| **Publishing flow** | Admin edit → GitHub Contents API commit → host auto-deploy from git → public static site. |

Route lists for the app, sitemap, and prerender share [`shared/site-routes.json`](./shared/site-routes.json).

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
| `npm run validate:content` | Zod-validate project JSON; block published placeholder copy |
| `npm run check:dist` | Post-build: internal links, canonical/OG hosts, 404 `noindex` |
| `npm run check:bundle` | Post-build gzip budgets (JS/CSS/HTML/fonts/first-paint) |
| `npm run check:deploy` | Live HTTPS gate: unknown paths → HTTP 404 + noindex |

## Deployment

Host-specific rules (404 status, security headers, temporary-subdomain → canonical redirect) live in **[`hosting/`](./hosting/README.md)**.  
**Active host today: Vercel** — the live file is [`vercel.json`](./vercel.json) at the repo root (mirrored under `hosting/`). When migrating, swap that file for the Netlify / Cloudflare / Nginx example in `hosting/`.

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

Set `VITE_FORMSPREE_ID` for Formspree delivery. Production builds fail if it is unset,
unless you deliberately set `ALLOW_MAILTO_CONTACT_FALLBACK=1` (CI does this). The dedicated
`/contact` page is the canonical destination; the About-page modal remains a shortcut.
Without Formspree, submit uses an honest `mailto:` fallback (fields are not cleared).

## License

See [`LICENSE`](./LICENSE) — all rights reserved.
