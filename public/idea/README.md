# DBS Studio private idea archive

Standalone Apache/PHP feature for https://dbsstudio.ir/idea/. This site is **React/Vite**, not WordPress; the /idea/ folder deliberately does not affect the React router, page registry, sitemap, shared styles, or existing pages.

## Publishing
- Files in public/idea/ copy into dist/idea/ during the normal Vite build and are deployed by the existing main -> CI -> FTPS workflow.
- Apache's inherited root config has `DirectoryIndex index.html`; local .htaccess overrides it with `DirectoryIndex index.php`.
- PHP is already required by /api/contact.php. Test /idea/ on the real Apache host; static Vite preview cannot execute PHP.
- The password is verified server-side via bcrypt and protected by CSRF, secure-session cookies on HTTPS and IP-limited login attempts. The default requested passphrase is **not stored in plaintext** in this public repo. As a 7-digit passcode it has limited entropy: use a longer unique passphrase for stronger protection.
- The app sets noindex and no-store on responses, and creates no client-side static copy of private data.
- Runtime idea data is written to `public/idea/.ideas.php` **on the host**, not in GitHub or dist. The PHP file returns its data without rendering anything on direct access; Apache denies dotfiles. Permission to create files within /idea/ is needed for publishing. Failed saves display an error.
- The runtime idea file is intentionally NOT in the repo or deployment artifact, so ordinary FTP syncs should not overwrite it. Back up this runtime file separately: GitHub does not store it.
- Login -> expand "افزودن ایده جدید" -> submit. The six score fields determine the average score automatically.
- URLs in evidence fields become links after HTML escaping; raw HTML is never rendered.

## Automated twice-daily idea publishing

A GitHub Issues bridge securely publishes new ideas without placing plaintext in public repository files, workflow inputs or workflow logs:

1. On a reviewed `main` push, `.github/workflows/idea-encryption-public-key.yml` derives a public encryption key from the **already-configured** `BALE_BOT_TOKEN` GitHub Actions secret and commits only the public key at `public/idea/public-key.json` (GitHub connector can read this file).
2. The idea-generation automation reads the public key from the GitHub repo, encrypts exactly one structured idea as a libsodium `crypto_box_seal` envelope and creates a GitHub Issue with exact title `DBS-IDEA-V1`. The issue body must contain ONLY `DBS-IDEA-V1:<base64 sealed box ciphertext>` (no title, prompt, URLs or plaintext details).
3. The `Publish encrypted idea` workflow runs only for issues opened by `sanyzrn` with that exact title. It signs the ciphertext using the existing Actions secret and POSTs it to `/idea/ingest.php` over HTTPS.
4. The PHP endpoint verifies signature, decrypts using the secret already available to `/api/bale-config.php`, validates schema and scores, and uses the **same** locked private storage as the manual form. A successful delivery closes the GitHub Issue and replaces its encrypted body with a success statement.
5. If delivery fails, the Issue remains open and the workflow fails. Never claim success based merely on an Issue being created; confirm the GitHub Actions workflow result.

Both PHP endpoints and the public key require the PHP Sodium extension; CI tests cryptography, duplicate detection, authentication and unauthenticated page privacy. The public key is non-secret; the Bale token, signing key, plaintext idea, password, and `.ideas.php` must never be logged or committed.

**Operational caveats:** Publishing only works if GitHub repository Actions can commit the public key, Issues are enabled, and the host has the correct Bale config + Sodium. This implementation uses a pre-existing secret rather than introducing a new unconfigured token. If the Bale bot token rotates, re-run the public key workflow before publishing more ideas. The archive is server-side and remains usable by hand even if GitHub delivery is unavailable.

## Non-goals
No WordPress plugin, no React route changes, no public plaintext idea export, no front-end dependencies and no changes to other public pages.
