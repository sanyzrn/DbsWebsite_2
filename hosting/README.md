# Host-specific deployment config

> **ACTIVE HOST: Apache FTP (`https://saeedzarrini.ir`)**  
> Automated deploy: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) builds after CI on `main` and uploads `dist/` (including `dist/.htaccess`) via FTP.  
> This FTP account’s root **is already** `public_html` — `server-dir` must stay `./` (do not nest under `/public_html/`).
>
> **Safety net:** [`/vercel.json`](../vercel.json) remains available for Vercel previews (must stay at the repo root — Vercel only reads that path). Keep `hosting/vercel.json` in sync when editing it. Do not disconnect Vercel until FTP on the real domain is confirmed end-to-end.

This folder isolates everything that is **host-specific**. App logic (prerendered `404.html` / `en/404.html`, `noindex` meta, `SITE_URL`) is host-independent and lives in the build.

When migrating hosts, **apply the equivalent rules from the matching example below**. Update this README's "ACTIVE HOST" line so the next person knows which file is authoritative.

## What must be ported on every host

1. **True HTTP 404** for unmatched paths  
   - Non-English → `404.html` with status **404**  
   - Paths under `/en…` → `en/404.html` with status **404**  
   - Existing prerendered files/assets must still be served normally (filesystem-first).  
   - On Vercel this is expressed with the legacy `routes` array (filesystem handle, then status 404 destinations) so the status code is real — plain `rewrites` to `404.html` would soft-404 with HTTP 200.  
   - On Apache use `RewriteCond %{REQUEST_FILENAME} !-f` / `!-d` before any 404 fallback, plus locale-aware `ErrorDocument 404` (see `apache.htaccess.example`).

2. **Security headers on every response** (no HSTS yet — wait until the permanent host + TLS for `saeedzarrini.ir` are locked in)  
   - Applied in the same `routes` entry with `"continue": true` on Vercel (top-level `headers` would be ignored when `routes` is present).  
   - On Apache use `Header set` via `mod_headers` (verify the module is enabled on shared hosts).  
   - `Content-Security-Policy` (see annotated breakdown below)  
   - `X-Content-Type-Options: nosniff`  
   - `Referrer-Policy: strict-origin-when-cross-origin`  
   - `Permissions-Policy` (deny unused browser features)  
   - `X-Frame-Options: DENY` (also mirrored by CSP `frame-ancestors 'none'`)

3. **Canonical hostname redirect**  
   - Temporary provider subdomain → `https://saeedzarrini.ir` (308)  
   - Current temporary host (Vercel preview): `dbs-website-2.vercel.app`  
   - Only keep this while that subdomain is live; update the hostname string when the preview URL changes.  
   - Verified reachable: `https://saeedzarrini.ir` should serve TLS successfully (do not point `SITE_URL` at a host that does not resolve).

4. **`SITE_URL` env var** (not in these files)  
   - Must be an origin that actually resolves over HTTPS before promoting a build.  
   - Change only the env value when migrating — no code change required.  
   - Production FTP builds set `SITE_URL` from the GitHub Actions secret.  
   - Promotion gate: `npm run check:deploy`.

## CSP directive notes (auto-generated — do not hand-edit host CSP strings)

`npm run build` → `scripts/prerender.mjs` → `scripts/csp.mjs` writes the same
`Content-Security-Policy` value into every host config below, plus `dist/.htaccess`,
`hosting/csp-header.txt`, and a `<meta http-equiv="Content-Security-Policy">` on each
prerendered HTML page (so the policy matches the per-build script nonce even if a host
snapshots config before the build finishes).

| Directive | Why |
|-----------|-----|
| `default-src 'self'` | Deny by default; only same-origin unless overridden |
| `script-src 'self' 'nonce-…'` | App bundles + FOUC/theme bootstrap + JSON-LD (nonce injected at prerender; `PageMeta` reuses `meta[name=csp-nonce]`) |
| `style-src 'self'` (+ optional `'unsafe-hashes' sha256-…`) | Bundled CSS; app avoids inline `style=` attrs. Any remaining prerendered style attrs are hashed |
| `font-src 'self' data:` | Self-hosted `@fontsource` fonts (no Google Fonts CDN) |
| `img-src 'self' data: blob:` | Site images + inline/data URLs |
| `connect-src 'self' https://formspree.io` | Contact form POST when `VITE_FORMSPREE_ID` is set (Formspree domain — not the site apex) |
| `form-action 'self' https://formspree.io` | Form posts (Formspree endpoint — not the site apex) |
| `worker-src 'self' blob:` | PWA service worker + any blob workers (e.g. three.js) |
| `frame-ancestors 'none'` | Clickjacking protection (pairs with `X-Frame-Options`) |
| `object-src 'none'` | No plugins |
| `upgrade-insecure-requests` | Prefer HTTPS subresources |

**Apache FTP:** prefer `dist/.htaccess` from the **same** build as the HTML (nonce must match). The GitHub Actions deploy workflow uploads that file with `dist/`. Prefer that over copying a stale `apache.htaccess.example` from an older commit by hand.

**Do not add `Strict-Transport-Security` here until the final host is permanent.**

## Files in this folder

| File | Purpose |
|------|---------|
| `csp-header.txt` | Latest CSP string written by the build (readable single source) |
| `apache.htaccess.example` | Source for `dist/.htaccess` (CSP line regenerated on build); also usable for a one-time manual upload if needed |
| `vercel.json` | Copy of the root Vercel config (CSP regenerated on build; keep in sync with `/vercel.json`) |
| `nginx.conf.example` | Drop-in Nginx snippet for plain static hosting |
| `netlify.toml.example` | Netlify headers + redirects + 404 |
| `cloudflare/_redirects.example` | Cloudflare Pages `_redirects` |
| `cloudflare/_headers.example` | Cloudflare Pages `_headers` |

**Note on the current apex (`saeedzarrini.ir`):** Production is served via **Apache + GitHub Actions FTP**. Each deploy uploads `dist/.htaccess` produced by the build. Until a `.htaccess` is next to `index.html`, unknown paths may still return a stock host 404 without the app `noindex` body. Vercel preview deployments use `/vercel.json` (re-read on deploy; also rely on per-page meta CSP for the build nonce).

After editing non-CSP parts of `/vercel.json`, copy the same JSON into `hosting/vercel.json` so this folder stays the migration reference — then re-run build so CSP stays generated.
