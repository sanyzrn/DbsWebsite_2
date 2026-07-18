# Custom PHP + MySQL Projects Admin Panel — Build Prompt

Architecture: a small, self-hosted PHP + MySQL admin panel (on Saeed's own hosting/domain)
manages project content in a database. On publish, it writes the same JSON shape the static
site already expects into the GitHub repo via the GitHub API, so the live site stays 100%
static, indexable, and on the existing Vercel CI/CD pipeline — the database is a private
authoring tool, never a runtime dependency of the public site.

Hand this to Claude Code as one job (or split by numbered section if preferred — each
section is independently completable).

---

## 1. Database schema (MySQL)

```
Create a MySQL schema for a single-admin project-management tool with this table:

CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  status ENUM('production', 'concept') NOT NULL DEFAULT 'concept',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  name_fa VARCHAR(120) NOT NULL,
  name_en VARCHAR(120) NOT NULL,
  subtitle_fa VARCHAR(255),
  subtitle_en VARCHAR(255),
  desc_fa TEXT,
  desc_en TEXT,
  problem_fa TEXT,
  problem_en TEXT,
  approach_fa TEXT,
  approach_en TEXT,
  result_fa TEXT,
  result_en TEXT,
  role_fa JSON,      -- array of strings
  role_en JSON,
  tech JSON,          -- array of strings, shared across locales
  tags JSON,          -- array of strings, shared across locales
  image_url VARCHAR(500),
  published_sha VARCHAR(64),   -- last git commit SHA this row was published as, for tracking
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,  -- Argon2id via PHP's password_hash()
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  success BOOLEAN NOT NULL
);

This schema is for a single admin user (Saeed) — do not build multi-user/role management,
it adds complexity with no real benefit here. Seed admin_users with exactly one row created
through a CLI setup script (php setup_admin.php --username=... --password=...), never via
a public-facing registration form — there must be no public sign-up path.
```

---

## 2. PHP backend structure & authentication

```
Build a PHP 8+ backend (no framework required — plain PHP with PDO is fine for this scope;
Laravel/Slim only if Saeed already has one of these set up on his hosting and prefers it)
with this structure:

/admin
  /public
    index.php          -- login page + dashboard entry point
    login.php
    logout.php
    project-edit.php
    upload-image.php
    publish.php
  /src
    Database.php        -- PDO connection, using prepared statements everywhere, no raw
                           string-interpolated SQL anywhere in the codebase
    Auth.php             -- session-based auth, password_verify() against admin_users,
                           CSRF token generation/validation for every POST form
    ProjectRepository.php -- CRUD against the projects table
    GitHubPublisher.php  -- see section 4
    ImageHandler.php     -- see section 3
  /config
    config.php           -- reads DB credentials, GitHub token, and repo details from
                           environment variables (never hardcoded, never committed) —
                           use a .env file loaded via a minimal parser or vlucas/phpdotenv
                           if Composer is available

Authentication requirements:
  - Single login form (username + password), session-based auth (PHP native sessions,
    session_regenerate_id() on login to prevent session fixation).
  - Rate-limit login attempts: check login_attempts for 5+ failed attempts from the same
    IP within 15 minutes and block further attempts with a clear message (429-style
    response), logging every attempt (success and failure) to login_attempts.
  - CSRF token (random, session-bound) required and validated on every state-changing
    request (create/update/delete/publish).
  - All admin routes require an authenticated session; redirect to login.php otherwise.
  - Force HTTPS (redirect HTTP → HTTPS at the top of every entry script, or configure at
    the webserver level and note that requirement in a README).
  - Set secure session cookie flags: `Secure`, `HttpOnly`, `SameSite=Strict`.

Do not build password reset via email, multi-user support, or any public registration —
out of scope and unnecessary attack surface for a single-admin tool.
```

---

## 3. Project CRUD UI + image handling

```
Build a simple, functional (not necessarily fancy) admin UI:
  - A dashboard listing all projects, sorted by display_order, showing slug, name_fa,
    status, featured, and a small thumbnail if image_url is set. Include quick-toggle
    controls for `featured` and inline `display_order` editing directly in the list (small
    number input + auto-save on blur, no full page reload needed — a small fetch() call to
    a dedicated endpoint is fine).
  - An edit form per project covering every column in the schema, with clearly labeled
    fa/en pairs side by side for translatable fields. `role_fa`/`role_en`/`tech`/`tags`
    should be simple line-per-item textareas (one value per line) converted to/from JSON
    arrays server-side — do not require Saeed to hand-write JSON syntax.
  - Server-side validation on save: slug must be lowercase alphanumeric + hyphens only and
    unique (excluding the current row on edit), required fields (name_fa, name_en, status)
    must be non-empty, `tech`/`tags`/`role_*` must parse into valid arrays. Show clear
    inline error messages, not a generic failure page.
  - Image upload (upload-image.php): accept JPEG/PNG/WebP only, max 5MB, validate the
    actual file content (not just the extension/MIME header — use PHP's getimagesize() or
    an image-processing library to confirm it's a real image), strip EXIF metadata, and
    re-encode/re-save the image server-side (e.g. via GD or Imagick) rather than storing
    the uploaded file byte-for-byte — this neutralizes most image-based upload exploits.
    Store the processed file in a directory OUTSIDE any web-executable PHP path (e.g.
    /admin/uploads/, with the webserver configured to serve static files from there but
    never execute PHP in that directory — document this webserver config requirement
    clearly in the README, e.g. an .htaccess `php_flag engine off` for Apache or an
    equivalent Nginx location block). Save the final public HTTPS URL for that image into
    `image_url` — the image itself stays on Saeed's own hosting; only the URL reference
    gets published to the static site's git repo (do not commit binary images into git —
    keeps repo size and history clean).
```

---

## 4. Publish mechanism — DB → GitHub → existing static site

```
Build GitHubPublisher.php, responsible for turning the current state of the `projects`
table into the exact JSON shape the static site's build process already expects (matching
the content/projects/<slug>.json structure from the earlier CMS-content migration — id/slug,
name/subtitle/desc (fa/en), role (fa/en), tech, tags, status, featured, display_order,
problem/approach/result (fa/en), image_url).

Publish flow (triggered by a "Publish changes" button on the dashboard, not automatically
on every save — batches edits into one deliberate action):
  1. Query all rows from `projects`, ordered by display_order.
  2. For each row, generate its JSON file content matching the existing schema exactly.
  3. Use the GitHub REST API (Contents API: GET to read the current file SHA, PUT to
     create/update) to write or update each content/projects/<slug>.json file directly on
     the repo's main branch (or a dedicated branch like `content-update` if Saeed prefers
     reviewing a PR before merge — make this configurable via an env flag
     PUBLISH_MODE=direct|pull-request).
  4. If a project's slug was renamed or a project was deleted from the admin panel, also
     delete the corresponding old JSON file via the Contents API's delete endpoint.
  5. Update each published row's `published_sha` column with the resulting commit SHA for
     traceability, and show a "Published successfully — commit <short-sha>" confirmation
     with a link to the commit on GitHub.
  6. No separate deploy hook call is needed if Vercel (or whatever host serves the static
     site) is already configured to auto-deploy on push to the connected branch — confirm
     this is the case; if not, add one explicit POST request to the Vercel Deploy Hook URL
     (stored in config, never hardcoded) as the final step of the publish flow.

GitHub authentication: use a fine-grained Personal Access Token scoped to ONLY this one
repository with ONLY "Contents: Read and write" permission — no broader token, no
organization-wide access. Store it in the server's environment configuration, never in the
database, never in any file committed to any git repository, and never exposed to the
admin UI's frontend/JS.

Add a "Preview diff" step before publish: show a simple before/after summary (which
projects changed, added, or removed since the last publish) so Saeed can review before
committing — comparing current DB state against the last-published JSON content already in
the GitHub repo (fetch current file contents via the Contents API for comparison).
```

---

## 5. Security checklist (verify all of these explicitly)

```
Before considering this done, confirm every one of the following:
  - Every SQL query uses PDO prepared statements with bound parameters — grep the codebase
    for any string-concatenated SQL and eliminate it.
  - The admin panel is not reachable without authentication on any route, including
    upload-image.php and publish.php directly.
  - CSRF tokens are checked on every POST/PUT/DELETE action.
  - Login attempts are rate-limited per the login_attempts table logic in section 2.
  - Uploaded files are re-encoded (not stored as-is), type-validated by content (not
    extension), and stored outside any PHP-executable directory.
  - The GitHub PAT and DB credentials are read only from environment variables/a
    non-committed config file, and that file is added to .gitignore in the admin panel's
    own repository.
  - HTTPS is enforced for the entire /admin area.
  - Session cookies use Secure, HttpOnly, and SameSite=Strict.
  - There is no public registration endpoint and no way to create additional admin_users
    rows except via the CLI setup script.
  - A basic automated MySQL backup (daily cron running mysqldump to a private, rotated
    backup location) is documented in the README, even if Saeed sets up the actual cron job
    himself on his hosting control panel.
```

---

## 6. Frontend compatibility (no changes needed if done right)

```
Confirm the JSON shape written by GitHubPublisher.php exactly matches the TypeScript type
already used by the static site for project content (from the earlier CMS-migration pass —
id/slug, name/subtitle/desc per locale, role per locale, tech, tags, status, featured,
display_order → order, problem/approach/result per locale, image_url). If any field name
differs (e.g. `display_order` in MySQL vs. `order` in the TypeScript type), decide on ONE
canonical name and use it consistently on both sides rather than silently renaming during
JSON generation — document the chosen name once in both codebases' README files so there is
no confusion later about which name is authoritative.

No changes should be needed to the React/Vite site itself beyond what the earlier CMS pass
already did (content/projects/*.json loaded at build time) — this PHP+MySQL system simply
replaces Decap CMS as the tool that produces those same JSON files.
```
