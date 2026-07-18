# Projects Admin Panel (PHP + MySQL)

Self-hosted authoring tool for portfolio projects. Publishes JSON into the static site repo via the GitHub Contents API. The public site never talks to this database at runtime.

## Requirements

- PHP 8.1+ with extensions: `pdo_mysql`, `json`, `mbstring`, `gd` (or Imagick)
- MySQL 8+ (or MariaDB 10.5+)
- HTTPS for the `/admin` vhost
- Webserver must **not** execute PHP inside `admin/uploads/` (see below)

## Setup

1. Copy env example and fill in secrets:

```bash
cp admin/config/.env.example admin/config/.env
# edit admin/config/.env — never commit this file
```

2. Create the database schema:

```bash
mysql -u root -p < admin/sql/schema.sql
```

3. Create the single admin user (CLI only — no public registration):

```bash
php admin/bin/setup_admin.php --username=saeed --password='choose-a-strong-password'
```

4. Point the webserver document root (or an alias) at `admin/public/`.

5. Configure uploads as static-only:

**Apache** (`admin/uploads/.htaccess` is included):

```apache
php_flag engine off
```

**Nginx** example:

```nginx
location /admin/uploads/ {
    alias /path/to/repo/admin/uploads/;
    location ~ \.php$ { deny all; }
}
```

6. Set `IMAGE_PUBLIC_BASE_URL` to the HTTPS URL that serves those files.

## Publish flow

1. Edit projects in the dashboard (saved to MySQL only).
2. **Preview diff** compares DB state to `content/projects/*.json` on GitHub.
3. **Publish changes** writes/updates/deletes those JSON files via the GitHub API.
4. Vercel (or your host) auto-deploys from the configured branch. Optionally set `VERCEL_DEPLOY_HOOK_URL`.

### Publish modes

| `PUBLISH_MODE` | Behavior |
|----------------|----------|
| `direct` (default) | Commit straight to `GITHUB_BRANCH` |
| `pull-request` | Commit to `GITHUB_CONTENT_BRANCH` and open a PR into `GITHUB_BRANCH` |

## Canonical JSON field names

Use **`order`** (not `display_order`) in published JSON — matches `content/README.md` and `src/lib/projects.ts`.

MySQL column is `display_order`; `GitHubPublisher` maps it to `order` on write.

## Daily backup (document for hosting cron)

```bash
# Example — adjust paths/credentials; store dumps outside the web root
mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  | gzip > "/private/backups/projects-$(date +%F).sql.gz"
# Keep last 14 days
find /private/backups -name 'projects-*.sql.gz' -mtime +14 -delete
```

## Security checklist

- [x] PDO prepared statements only
- [x] Auth required on all admin routes
- [x] CSRF on every POST
- [x] Login rate limit (5 failures / 15 min / IP)
- [x] Image re-encode + type validation; uploads outside PHP execution
- [x] Secrets from env / `.env` (gitignored)
- [x] Session cookies: Secure, HttpOnly, SameSite=Strict
- [x] HTTPS redirect in bootstrap
- [x] No public registration — CLI setup only
