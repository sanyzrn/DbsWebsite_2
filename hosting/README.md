# Host-specific deployment config

> **ACTIVE HOST: Apache FTP (`https://saeedzarrini.ir`)**  
> Automated deploy: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) builds after CI on `main` and uploads `dist/` (including `dist/.htaccess`) via FTP.  
> This FTP account’s root **is already** `public_html` — `server-dir` must stay `./` (do not nest under `/public_html/`).

This folder isolates everything that is **host-specific**. App logic (prerendered `404.html` / `en/404.html`, `noindex` meta, `SITE_URL`) is host-independent and lives in the build.

When migrating hosts, **apply the equivalent rules from the matching example below**. Update this README's "ACTIVE HOST" line so the next person knows which file is authoritative.

## What must be ported on every host

1. **True HTTP 404** for unmatched paths  
   - Non-English → `404.html` with status **404**  
   - Paths under `/en…` → `en/404.html` with status **404**  
   - Existing prerendered files/assets must still be served normally (filesystem-first).  
   - On Apache use `RewriteCond %{REQUEST_FILENAME} !-f` / `!-d` before any 404 fallback, plus locale-aware `ErrorDocument 404` (see `apache.htaccess.example`).

2. **Security headers on every response** (no HSTS yet — wait until the permanent host + TLS for `saeedzarrini.ir` are locked in)  
   - On Apache use `Header set` via `mod_headers` (verify the module is enabled on shared hosts).  
   - `Content-Security-Policy` (see annotated breakdown below)  
   - `X-Content-Type-Options: nosniff`  
   - `Referrer-Policy: strict-origin-when-cross-origin`  
   - `Permissions-Policy` (deny unused browser features)  
   - `X-Frame-Options: DENY` (also mirrored by CSP `frame-ancestors 'none'`)

3. **Canonical hostname**  
   - Apex: `https://saeedzarrini.ir`  
   - Do not point `SITE_URL` at a host that does not resolve over HTTPS.

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
| `connect-src 'self'` | Contact form POST to `/api/contact.php` (same-origin) |
| `form-action 'self'` | Native form posts stay same-origin |
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
| `nginx.conf.example` | Drop-in Nginx snippet for plain static hosting |
| `netlify.toml.example` | Netlify headers + redirects + 404 (optional alternate host) |
| `cloudflare/_redirects.example` | Cloudflare Pages `_redirects` (optional alternate host) |
| `cloudflare/_headers.example` | Cloudflare Pages `_headers` (optional alternate host) |

**Note on the current apex (`saeedzarrini.ir`):** Production is served via **Apache + GitHub Actions FTP**. Each deploy uploads `dist/.htaccess` produced by the build. Until a `.htaccess` is next to `index.html`, unknown paths may still return a stock host 404 without the app `noindex` body.
