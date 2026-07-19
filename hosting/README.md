# Host-specific deployment config

> **ACTIVE HOST: Vercel**  
> Live config file: [`/vercel.json`](../vercel.json) (must stay at the repo root — Vercel only reads that path).

This folder isolates everything that is **host-specific**. App logic (prerendered `404.html` / `en/404.html`, `noindex` meta, `SITE_URL`) is host-independent and lives in the build.

When migrating hosts, **replace or ignore `vercel.json` and apply the equivalent rules from the matching example below**. Update this README's "ACTIVE HOST" line so the next person knows which file is authoritative.

## What must be ported on every host

1. **True HTTP 404** for unmatched paths  
   - Non-English → `404.html` with status **404**  
   - Paths under `/en…` → `en/404.html` with status **404**  
   - Existing prerendered files/assets must still be served normally (filesystem-first).  
   - On Vercel this is expressed with the legacy `routes` array (filesystem handle, then status 404 destinations) so the status code is real — plain `rewrites` to `404.html` would soft-404 with HTTP 200.

2. **Security headers on every response** (no HSTS yet — wait until the permanent host + TLS for `dbsgraphic.ir` are locked in)  
   - Applied in the same `routes` entry with `"continue": true` on Vercel (top-level `headers` would be ignored when `routes` is present).  
   - `Content-Security-Policy` (see annotated breakdown below)  
   - `X-Content-Type-Options: nosniff`  
   - `Referrer-Policy: strict-origin-when-cross-origin`  
   - `Permissions-Policy` (deny unused browser features)  
   - `X-Frame-Options: DENY` (also mirrored by CSP `frame-ancestors 'none'`)

3. **Canonical hostname redirect**  
   - Temporary provider subdomain → `https://dbsgraphic.ir` (308)  
   - Current temporary host: `dbs-website-2.vercel.app`  
   - Only keep this while that subdomain is live; update the hostname string when the preview URL changes.  
   - Verified reachable: `https://dbsgraphic.ir` serves TLS successfully (do not point `SITE_URL` at a host that does not resolve).

4. **`SITE_URL` env var** (not in these files)  
   - Must be an origin that actually resolves over HTTPS before promoting a build.  
   - Change only the env value when migrating — no code change required.  
   - Promotion gate: `npm run check:deploy`.

## CSP directive notes (keep comments when porting)

| Directive | Why |
|-----------|-----|
| `default-src 'self'` | Deny by default; only same-origin unless overridden |
| `script-src 'self' 'unsafe-inline'` | App bundles + FOUC/theme bootstrap + JSON-LD inline scripts in HTML |
| `style-src 'self' 'unsafe-inline'` | Bundled CSS + small inline style attributes |
| `font-src 'self' data:` | Self-hosted `@fontsource` fonts (no Google Fonts CDN) |
| `img-src 'self' data: blob:` | Site images + inline/data URLs |
| `connect-src 'self' https://formspree.io` | Contact form POST when `VITE_FORMSPREE_ID` is set |
| `form-action 'self' https://formspree.io` | Form posts (Formspree endpoint) |
| `worker-src 'self' blob:` | PWA service worker + any blob workers (e.g. three.js) |
| `frame-ancestors 'none'` | Clickjacking protection (pairs with `X-Frame-Options`) |
| `object-src 'none'` | No plugins |
| `upgrade-insecure-requests` | Prefer HTTPS subresources |

**Do not add `Strict-Transport-Security` here until the final host is permanent.**

## Files in this folder

| File | Purpose |
|------|---------|
| `vercel.json` | Copy of the active root config (keep in sync with `/vercel.json`) |
| `nginx.conf.example` | Drop-in Nginx snippet for plain static hosting |
| `netlify.toml.example` | Netlify headers + redirects + 404 |
| `cloudflare/_redirects.example` | Cloudflare Pages `_redirects` |
| `cloudflare/_headers.example` | Cloudflare Pages `_headers` |

**Note on the current apex (`dbsgraphic.ir`):** DNS currently points at Nginx (not Vercel). Until that server applies `nginx.conf.example` (or the domain is pointed at Vercel), production unknown paths may still return the stock Nginx 404 without the app `noindex` body. Preview / Vercel deployments use `/vercel.json` as soon as they are published.

After editing `/vercel.json`, copy the same JSON into `hosting/vercel.json` so this folder stays the single migration reference.
