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

## Automation integration limitation
The ChatGPT task currently generates an idea twice daily but is **not connected to a secure site publishing endpoint**. This release provides a working private archive and manual server-side publishing, **not** a claimed automatic connection. For real autopublishing, use a protected ingestion API with separate secret credentials plus a task runner that can POST to it. Do not put the idea text in this public GitHub repository to preserve the privacy requirement.

## Non-goals
No WordPress plugin, no React route changes, no public JSON export, no third-party dependencies and no changes to any other public page.
