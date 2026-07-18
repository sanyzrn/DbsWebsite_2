# Saeed Zarrini — portfolio (React 19 + Vite + Tailwind)

Frontend-only SPA. Project copy lives in `content/projects/*.json`; UI strings in `src/lib/i18n.ts`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Generate SEO files → check URLs → production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run generate:seo` | Write `public/robots.txt` + `public/sitemap.xml` from `SITE_URL` |
| `npm run check:urls` | Fail if SEO files hardcode a domain other than `SITE_URL` |

## Deployment

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

1. `generate:seo` writes `robots.txt` and `sitemap.xml` using `SITE_URL`
2. `check:urls` fails the build if those files or `index.html` still contain a different site domain
3. Vite replaces `__SITE_URL__` placeholders in `index.html` and exposes `import.meta.env.VITE_SITE_URL` to the app

Do not hardcode the site domain elsewhere — change `SITE_URL` only.

### Contact form

Set `VITE_FORMSPREE_ID` for Formspree delivery; without it, submit uses a `mailto:` fallback.
