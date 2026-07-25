# DbsWebsite_2 — Live-Site Audit Fix Prompts

Source: "Saeed Zarrini Portfolio (DbsWebsite_2) Audit — 2026" (audited from source + the live
production site at saeedzarrini.ir). Excluded: the x-default/English hreflang finding
(deliberate, not a bug), and the MagicDust bundle-weight concern (verified already correctly
dynamic-imported — no action needed). The personal-Yahoo-email branding mismatch is flagged
at the bottom as a decision point, not auto-fixed, since it needs a real branded email
address that doesn't exist yet.

---

## 1. Contact form hardening bundle (log location, error messages, length cap, timing bypass)

Covers: HIGH (log in web root), MEDIUM (generic errors), MEDIUM (no length cap), LOW (timing
bypass)

```
Four related fixes to public/api/contact.php and src/components/contact/ContactForm.tsx:

1. Move the diagnostic log out of the public web root. It currently writes to
   __DIR__ . '/contact-debug.log', making it fetchable at https://saeedzarrini.ir/api/
   contact-debug.log if it's ever created. Change the log destination to
   sys_get_temp_dir() . '/dbswebsite-contact-debug.log' (matching the same safe location
   already used by the rate-limit file), OR, if keeping it in a web-adjacent location is
   preferred for easier FTP access, add a deny rule to hosting/apache.htaccess.example:

     <FilesMatch "\.log$">
       Require all denied
     </FilesMatch>

   Prefer the sys_get_temp_dir() move — it's strictly safer and matches existing precedent.

2. Differentiate server error responses on the client instead of collapsing everything into
   one generic message. In ContactForm.tsx, replace the blanket `if (!res.ok) throw new
   Error(...)` with logic that parses the response body and branches on the `error` field
   contact.php already returns (`rate_limited`, `not_configured`, `bale_delivery_failed`,
   `validation_failed`):
     - `rate_limited` → a distinct, honest message (fa/en): "You've reached the hourly
       message limit — please try again later, or email directly at [address]." Do NOT let
       this retry into the same generic error wall.
     - Everything else → keep the current generic "something went wrong, try again" message,
       but at minimum stop implying the user should immediately retry when the real cause is
       rate-limiting.

3. Add a server-side length cap on all text fields in contact.php, before building $text —
   Bale's sendMessage rejects payloads over ~4096 characters, which currently surfaces as a
   confusing generic 502. Add, right after the existing validation block:

     $maxLen = ['name' => 100, 'email' => 254, 'message' => 3000, 'projectType' => 60];
     foreach ($maxLen as $field => $limit) {
       if (isset($$field) && mb_strlen($$field) > $limit) {
         http_response_code(400);
         echo json_encode(['ok' => false, 'error' => 'field_too_long', 'field' => $field]);
         exit;
       }
     }

   (Adjust variable references to match the actual variable names already in the file.) Add
   a matching client-side check in ContactForm.tsx so a user sees this before submitting,
   not just after a round-trip.

4. Fix the timing-gate bypass: `if ($elapsedMs > 0 && $elapsedMs < 2000)` currently lets a
   bot that omits the `elapsedMs` field entirely (defaulting to 0) skip the check completely.
   Change to treat missing/zero as a failed check:

     if ($elapsedMs < 2000) { // now also catches elapsedMs === 0 / missing
       http_response_code(200);
       echo json_encode(['ok' => true]);
       exit;
     }

Keep the honeypot and rate-limit logic exactly as they are — only these four specific issues
change.
```

---

## 2. Prevent draft content from being deployable, even by accident

Covers: MEDIUM (draft content prerendered + shipped with only noindex, no build gate)

```
listPrerenderPaths() in src/lib/seo.ts currently iterates every project (all maturity
values) and every article (all status values), meaning draft/unpublished content gets a real
static HTML file in dist/ and is deployed — protected only by a noindex meta tag with no
build-time assertion backing that invariant. If the noindex ternary in resolvePageSeo ever
regressed, unfinished content would silently go fully live with no test catching it.

Pick ONE of these two approaches (the first is simpler and removes the risk entirely; the
second is more conservative if draft routes need to stay reachable for internal preview):

Option A (recommended): Skip non-published/non-`maturity: "published"` slugs entirely in
listPrerenderPaths() — draft content simply doesn't get a dist/ file at all, so there's
nothing to accidentally expose. If Saeed needs to preview draft content, he can do so via a
local `npm run dev` build, which already has access to all content regardless of maturity.

Option B: Keep prerendering draft routes (for staging/preview convenience), but extend
scripts/check-dist.mjs to assert noindex is actually present on every prerendered path that
is NOT in sitemap.xml — failing the build if any draft/unpublished route lacks the noindex
meta tag, turning the current unenforced convention into a real, tested guarantee.

Implement whichever option Saeed prefers — Option A is the safer default if there's no
specific need to preview draft content on the live deployed site.
```

---

## 3. Retire or fix the permanently-empty /news page

Covers: MEDIUM (empty page in sitemap, linked from 3 places), part of UX section 8 below

```
content/news/ is currently empty, yet /news and /en/news are emitted in sitemap.xml at
priority 0.8, and the header nav, mobile menu, and footer all link to it — four separate
paths leading to a page whose only content is an empty-state message.

1. In scripts/generate-seo-files.mjs's sitemapStaticPaths(), conditionally omit /news and
   /en/news from the sitemap when `loadNewsItems().length === 0`.
2. Add `robots: "noindex"` to the News page's SEO resolution when the news list is empty
   (keep it indexable automatically once real items exist).
3. Hide the Daily Digest nav/footer link entirely when getLocalizedNewsItems() (or
   equivalent) returns zero items — in Nav.tsx, FloatingQuickNav.tsx, and Footer.tsx. This
   also fixes the numbering gap mentioned in the UI section below, since removing the empty
   link removes the awkward unnumbered item.
4. When real news items eventually exist, all of the above should automatically re-enable
   (sitemap inclusion, indexability, nav visibility) — verify this happens without needing
   another code change, since the whole point is that it's content-driven, not a manual
   toggle.
5. Improve NewsPage.tsx's empty state (in the rare case it's still reachable via a direct
   link before nav hiding takes effect) with a real forward action — e.g. a CTA to Field
   Notes' articles list or Contact — instead of only a "back" arrow.
```

---

## 4. SEO structured-data correctness: absolute image, brand name, 404 signals

Covers: MEDIUM (relative JSON-LD image), MEDIUM (Person.name — decision made), LOW (thin
titles), LOW (404 canonical/hreflang contradiction)

```
Four related src/lib/seo.ts / scripts/prerender.mjs fixes:

1. Project JSON-LD image is currently a root-relative path (work.image = project.image_url,
   e.g. "/images/projects/dbspulse.webp") — structured-data image properties must be
   absolute URLs or Google discards them. Fix:

     work.image = project.image_url.startsWith("http")
       ? project.image_url
       : `${origin}${project.image_url}`;

2. Decision made: revert the Person JSON-LD name and brand references back to the full
   "Saeed Zarrini" (prioritizing SEO/entity-resolution strength over the shorter "Saeed"
   used in the visible Hero/header/footer UI from the recent rebrand). Specifically:
     - `name: "Saeed"` → `name: "Saeed Zarrini"`, and add `givenName: "Saeed"` /
       `familyName: "Zarrini"` fields to the Person node.
     - `alternateName: "سعید"` → keep as `alternateName: "سعید زرینی"` (restore the full
       Persian name here too, for the same entity-resolution reasoning).
     - The WebSite node's name and `og:site_name` should consistently use "Saeed Zarrini" as
       well — pick ONE consistent brand string for all metadata/structured-data purposes
       (distinct from "DbsStudio", which stays as the visual H1/wordmark on the page itself —
       these are allowed to differ: DbsStudio is the visual brand, "Saeed Zarrini" is the
       canonical entity name for search engines).
   Note: the Hero H1, header, and footer visual text ("DbsStudio") from the recent rebrand
   are NOT reverted — this fix is scoped only to SEO metadata/structured data.
3. Detail-page `<title>` tags are currently thin (e.g. "DbsPulse | Saeed") and used a
   different, now-outdated brand token. Update the title template to include the project's
   subtitle/category and the corrected brand name from point 2, e.g.:
     `${project.name} — ${project.subtitle} | Saeed Zarrini`
   Apply the equivalent pattern to article detail titles too.
4. 404.html / en/404.html currently emit `<link rel="canonical">` and hreflang alternates
   despite being noindex — a contradictory signal (declaring canonical/alternate relationships
   for a page search engines are told not to index). In scripts/prerender.mjs's
   buildHeadTags(), skip canonical and hreflang tag emission entirely when the resolved
   `seo.robots` value contains "noindex".
```

---

## 5. Per-page Open Graph images

Covers: LOW (every page shares one generic og:image)

```
resolvePageSeo in src/lib/seo.ts currently hardcodes `image: \`${origin}/og.jpg\`` for every
page, including project and article details — meaning every shared case-study link looks
identical in Telegram/LinkedIn/X previews, wasting the per-page distinctiveness a shared case
study should have.

Update resolvePageSeo so project/article detail pages prefer their own image when available:
  image: project.image_url
    ? (project.image_url.startsWith("http") ? project.image_url : `${origin}${project.image_url}`)
    : `${origin}/og.jpg`

Apply the same fallback pattern for articles (using whatever cover-image field exists or
falls back to /og.jpg if none). Since most projects currently only have mock illustrations
rather than real 1200×630 screenshots, this will mostly still fall back to /og.jpg today —
but the plumbing will be correct and automatically improve as real project images are added
later (per the standing image-format reference already documented).
```

---

## 6. Real CSP script protection — replace the static nonce with per-script hashes

Covers: MEDIUM (nonce is a committed, per-build constant with no replay protection)

```
scripts/prerender.mjs currently generates ONE nonce for the entire build, stamps it into
every prerendered page, writes it into dist/.htaccess, and commits it back into
hosting/apache.htaccess.example via writeCspToHostingConfigs() — meaning the "nonce" is
public, static across all pages, and stable for the deploy's lifetime, providing no real
replay protection. For a fully static site, a nonce can't be made genuinely per-response
anyway, so this mechanism was never going to deliver real nonce security.

The codebase already computes `sha256Integrity` per inline script and currently discards it
as mere "diagnostics" — use it for real: switch `script-src` in the generated CSP to the
specific `'sha256-<hash>'` values for each distinct inline script actually present (the
FOUC/theme-bootstrap script, and each page's JSON-LD block), removing the nonce mechanism
entirely. Update writeCspToHostingConfigs() to write the computed hash set into the CSP
header instead of a nonce, and stop writing any nonce value into hosting/apache.htaccess.example
(remove the currently-committed nonce string from that file — it serves no purpose and its
presence in git history is itself a minor tell that the mechanism wasn't providing real
protection). Test thoroughly after this change — a mismatched hash silently breaks the
FOUC-prevention script or JSON-LD rendering without an obvious visual symptom.
```

---

## 7. UI polish bundle (floating elements collision, DOM duplication, numbering, separators)

Covers: MEDIUM (scroll-to-top / quick-nav collision on small phones), MEDIUM (duplicated
project cards in DOM), LOW (mobile menu numbering gap — see also section 3), LOW (footer
separator inconsistency)

```
Four independent UI fixes:

1. On small phone widths, the bottom-left scroll-to-top button and the bottom-right
   FloatingQuickNav pill may sit close enough to visually collide or feel cramped — audit
   their actual computed positions/widths at 360-375px viewport widths (the narrowest common
   phones) and ensure adequate horizontal gap between them; increase inset/offset values or
   reduce one element's footprint on the narrowest breakpoint if they currently overlap or
   sit uncomfortably close.

2. The homepage currently renders each featured project TWICE in the DOM — once as a compact
   card, once as an expanded card with Role/Technology blocks — almost certainly a
   `md:block`/`md:hidden` responsive pair rather than one CSS-driven component. This doubles
   the prerendered HTML weight of the homepage's largest section and produces two <h3>
   elements per project in the source (a real, if minor, SEO/semantics concern beyond just
   the bundle-weight cost). Consolidate into a single ProjectCard component whose internal
   layout adapts via CSS (e.g. showing/hiding the Role/Technology block with a responsive
   class) rather than shipping two full component instances. This affects src/components/
   Projects.tsx specifically.

3. Mobile menu numbering: with the Daily Digest link now hidden when empty (per section 3
   above), verify the remaining numbered items (Projects, Field Notes, Expertise, Process,
   About, Contact) renumber correctly and sequentially with no gap — this should resolve
   automatically once section 3's fix removes the unnumbered Daily Digest entry, but confirm
   the remaining sequence reads 01-06 with no skip.

4. Footer link separators currently mix `·` and `/` inconsistently (a `/` appears specifically
   around Daily Digest, presumably to indicate it's a sub-item, while every other separator is
   `·`). Once Daily Digest is conditionally hidden per section 3, this likely resolves itself
   for the empty-news case — but for when Daily Digest IS visible (once news content exists),
   use a consistent visual treatment (e.g. smaller/indented sub-link under Field Notes,
   matching however FloatingQuickNav already visually subordinates it) rather than a bare `/`
   separator that reads as a typo.
```

---

## 8. UX: unify duplicate "projects" destinations

Covers: LOW (hero CTA and nav "Projects" link go to two different places)

```
The Hero's primary CTA ("See the projects") currently links to an on-page anchor (/#projects
on the home page), while the header nav's "Projects" link goes to the full dedicated route
(/projects) — two visually similar affordances sharing conceptually the same label but
landing in different places, which reads as inconsistent.

Pick one: either point the Hero CTA directly at /projects (the full page, matching the nav)
since that's the more complete destination and the home page's project teaser already exists
below the fold as a preview — or relabel the Hero CTA to something that honestly describes
the anchor destination (e.g. "See featured work below" / "مشاهده‌ی نمونه‌کارهای منتخب" instead
of implying it's the same as the full Projects page). Prefer pointing it at /projects
directly — it's the simpler fix and matches user expectation better.
```

---

## 9. Housekeeping (CI scope, repo cleanliness, WhatsApp link format)

Covers: LOW (admin/ still coupled to CI health), LOW (working prompt docs at repo root), LOW
(WhatsApp link format)

```
Three small, independent cleanups:

1. In .github/workflows/ci.yml's PHP syntax-check job, narrow the file search from
   `find admin public/api` to just `find public/api` — admin/ is deactivated/standby and
   never deployed (per admin/README.md and the main README.md), so CI build health shouldn't
   depend on it. If admin/'s code is worth preserving for potential future reactivation,
   that's fine — it just shouldn't be able to fail the build for a project that no longer
   ships it.

2. Move DbsWebsite_Audit2_Fix_Prompts.md and PHP_MySQL_Admin_Panel_Prompt.md (both AI working
   notes, not application code) out of the repository root — either into a docs/ or
   docs/archive/ folder, or remove them from the repo entirely if they're no longer needed
   as a reference (their content has already been acted upon).

3. Fix the WhatsApp footer link format: `https://wa.me/+989301221816` uses an undocumented
   "+" prefix — WhatsApp's documented click-to-chat format is digits only, no plus sign,
   brackets, or dashes. Change to `https://wa.me/989301221816`.
```

---

## Flagged for a decision, not auto-fixed

- **Personal Yahoo email in the footer** (`zrn_sany@yahoo.com`) — the audit correctly notes
  this undercuts the "DbsStudio" studio positioning and is trivially scraped from a plain
  `mailto:` link. The right fix is a branded address on the owned domain (e.g.
  `hello@saeedzarrini.ir`), but that requires setting up real email hosting/forwarding for
  the domain first — not something to fake with a placeholder. Once a real branded email
  exists, say so and this becomes a one-line swap across the footer, privacy policy, and
  anywhere else the address appears.

---

## 10. FTP deploy security bundle (plaintext protocol, leftover diagnostic, exposed credentials)

Covers: (o5/o5h) plaintext FTP, leftover lftp diagnostic step, README exposing server/username

```
Three related deploy-pipeline hardening fixes in .github/workflows/deploy.yml and README.md:

1. FTP-Deploy-Action currently has no `protocol:` key, defaulting to unencrypted FTP — the
   password and every uploaded file (including dist/api/bale-config.php, which contains the
   Bale bot token) cross the network in the clear. Add `protocol: ftps` to the
   SamKirkland/FTP-Deploy-Action step. Test a deploy after this change and confirm it still
   succeeds — if the host doesn't actually support FTPS despite offering it nominally, fall
   back to `protocol: ftp` but flag this clearly so Saeed can ask hosting support about FTPS/
   SFTP availability specifically.

2. Remove the "FTP connectivity diagnostic" step entirely (the one running `lftp -d` with
   `set ftp:ssl-allow no`) — this was added temporarily to debug the original 531
   authorization error, which is long since resolved. It currently runs on every single
   deploy, explicitly negotiates a plaintext session, and dumps protocol-level debug output
   (including credential exchange metadata) into the public build log every time.

3. In README.md's documented-secrets section, replace the literal values currently shown for
   FTP_SERVER (`server78i.irwebspace.com`) and FTP_USERNAME (`sany@saeedzarrini.ir`) with
   generic placeholders (e.g. `your-ftp-host.example.com`, `user@yourdomain.tld`) — only
   FTP_PASSWORD was ever treated as sensitive; the other two-thirds of the credential triple
   being public in a README reduces the effective security of the whole setup.

4. Pin `SamKirkland/FTP-Deploy-Action@v4.3.5` to a full commit SHA instead of a mutable tag
   (Dependabot is already configured and will keep it current) — a workflow handling FTP
   credentials shouldn't depend on a tag that could theoretically be moved.
```

---

## 11. Apache config: caching, compression, and HSTS

Covers: (o5) no cache/compression rules, stale HSTS deferral

```
Two additions to hosting/apache.htaccess.example:

1. Add caching and compression directives — currently there's 404 routing and security
   headers but nothing for asset caching or compression:

     <IfModule mod_expires.c>
       ExpiresActive On
       ExpiresByType text/css "access plus 1 year"
       ExpiresByType application/javascript "access plus 1 year"
       ExpiresByType font/woff2 "access plus 1 year"
     </IfModule>
     <IfModule mod_headers.c>
       <FilesMatch "\.(css|js|woff2)$">
         Header set Cache-Control "public, max-age=31536000, immutable"
       </FilesMatch>
       <FilesMatch "\.html$">
         Header set Cache-Control "no-cache"
       </FilesMatch>
     </IfModule>
     <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
     </IfModule>

   Since content-hashed filenames are already used for JS/CSS/fonts (per earlier work), the
   `immutable` long-cache directive is safe — a changed file gets a new filename, not a
   stale cache collision.

2. HSTS was deliberately left disabled pending a stable domain/TLS setup — that condition is
   now met (saeedzarrini.ir is live and stable). Add, starting with a short max-age to allow
   safe rollback if anything is wrong, then increase later:

     Header always set Strict-Transport-Security "max-age=86400; includeSubDomains"

   After confirming no issues for a week or two, raise max-age to 31536000 (1 year) and
   consider adding `preload` only once fully confident (HSTS preload is very hard to reverse
   quickly if something goes wrong).
```

---

## 12. Header offset bug at desktop breakpoint

Covers: (o5h) `pt-[88px] lg:pt-0` removes header offset at ≥1024px while header stays fixed

```
In src/App.tsx, <main> currently applies `pt-[88px] lg:pt-0` when `clearFixedNav` is true —
removing the top padding entirely at the `lg` breakpoint (≥1024px), while Nav.tsx's header
remains `fixed inset-x-0 top-0` at every breakpoint (a 72px-tall bar). This means on desktop,
non-home routes have their first section's content and border starting underneath the fixed
header instead of below it — confirmed by reading both files directly.

Fix: keep a consistent offset at all breakpoints instead of zeroing it at lg — e.g. change to
just `pt-[88px]` (no responsive override) if 88px reads fine at every width, or tune to the
header's actual rendered height plus margin at each breakpoint if the header's height itself
changes responsively (check Nav.tsx for any breakpoint-conditional height). Verify visually
at 1024px, 1280px, and 1440px+ widths on a non-home page (e.g. /projects or /about) that the
top of the first section is no longer hidden behind the header.
```

---

## 13. Language-preference localStorage bug + PWA manifest lang/dir mismatch

Covers: (o5h) visiting /en permanently overwrites saved preference; manifest declares wrong lang/dir for its start_url

```
Two related src/lib/app.tsx / vite.config.ts fixes:

1. The effect that syncs `document.documentElement.lang/dir` on every lang/dir change also
   writes `localStorage.setItem("sz-lang", lang)` unconditionally — including when `lang` was
   derived purely from the current URL (e.g. a Persian visitor opening a shared /en/... link),
   not from an explicit user choice. This silently and permanently overwrites their saved
   preference, and LocalePreferenceRedirect.tsx then keeps bouncing them to /en on every future
   visit. `setLang()` already persists the preference correctly and explicitly on real user
   action (with a comment noting exactly why: to avoid this race). Fix: remove the
   `localStorage.setItem("sz-lang", lang)` line from the URL-sync effect entirely — only
   `setLang()`'s explicit write should ever update the stored preference.

2. vite.config.ts's VitePWA manifest config currently sets `lang: "en"`, `dir: "ltr"`, while
   `start_url: "/"` actually serves the Persian (RTL) homepage. Fix: either change
   `lang: "fa"` / `dir: "rtl"` to match what `start_url: "/"` actually serves, or change
   `start_url` to `/en` if English should be the PWA's default launch experience — pick
   whichever better matches the actual primary-audience intent (Persian is documented
   elsewhere in this project as the primary/default experience, so aligning the manifest's
   lang/dir to match `/` is likely the more consistent fix).
```

---

## 14. Real route-level code splitting (still not done)

Covers: (o5h) confirmed — no lazy-loading anywhere despite this being requested a while ago

```
Confirmed by direct inspection: src/lib/routesFromManifest.tsx statically imports every page
component, and both src/lib/articles.ts and src/lib/projects.ts use
`import.meta.glob(..., { eager: true })` — meaning every compiled MDX article (including the
draft/test fixtures) and every project's JSON content lands in the homepage's initial bundle,
even though earlier work already correctly lazy-gates the WebGL MagicDust layer.

1. Convert routesFromManifest.tsx's page imports to `React.lazy(() => import("../pages/
   XyzPage"))` for every route, wrapping the route tree in a `<Suspense>` boundary with a
   lightweight, on-brand loading fallback (respecting prefers-reduced-motion for any loading
   indicator animation).
2. Change `import.meta.glob(..., { eager: true })` to non-eager (lazy) dynamic imports in
   both articles.ts and projects.ts, and update whatever code currently assumes synchronous
   access to the resulting module map to handle the async resolution instead (likely
   requiring these to become async functions called once at the top of each page/list
   component, or resolved via a small loader utility — check how the data is currently
   consumed before changing the loading mechanism itself).
3. Verify with a bundle analysis that the homepage's initial JS chunk actually shrinks after
   this change, and re-run check:bundle to confirm the (currently tight) budget now has more
   headroom rather than being right at the ceiling.
```

---

## 15. Stop exposing build internals and improve service-worker 404 handling

Covers: (o5h) dist/csp-build.json publicly deployed; SW navigateFallback masks real 404s for returning visitors

```
Two related fixes:

1. scripts/prerender.mjs writes dist/csp-build.json (build nonce/hash counts/full CSP header)
   into the dist/ output, which is confirmed present after a real build and would be uploaded
   to production by the FTP deploy step, making build internals publicly fetchable. Either
   write this file outside dist/ entirely (e.g. to a temp/build-artifacts location used only
   for local debugging), or delete it as a step after check:dist validation but before the FTP
   upload step in deploy.yml.

2. scripts/workbox-shared-config.mjs's `workboxNavigateFallbackDenylist` only excludes
   `/admin` and `.php` paths from the service worker's navigateFallback — meaning once the SW
   is installed, ANY other unmatched navigation (a typo, an old shared link, a removed project
   slug) gets answered from the cached offline.html at HTTP 200 instead of showing the real
   404.html, for any returning visitor with the SW already active. Fix: precache both
   404.html and en/404.html alongside the existing precached routes, and change the
   navigation handling so a genuinely unmatched path is served from the locale-appropriate
   404.html when the browser is online, reserving offline.html strictly for the
   `!navigator.onLine` case (check whichever Workbox navigation-route API version is in use
   for the correct way to distinguish these two cases — a NetworkOnly-with-catch-handler
   pattern falling back to the cached 404 page, with a separate final fallback to
   offline.html only on an actual network error, is the standard approach).
```

---

## Additional note: creative-direction critique rejected for now

One of the three new reports (a UI/UX visual-design audit, not a technical one) proposed a
full art-direction pivot — a different color system (adding a "blueprint blue" secondary
accent, cooler dark mode), different fonts (General Sans/Estedad/JetBrains Mono instead of
Bricolage/Fraunces/Noto Serif Arabic/IBM Plex Mono), asymmetric grids, killing the
scroll-to-top button in favor of the nav pill alone, and reducing scroll-reveal animations
site-wide. Per explicit decision, none of this is being pursued right now — the current
Oxide + Fraunces direction (chosen deliberately in recent work) stays as-is. Noted here only
so this critique isn't silently lost if it's worth revisiting later as a deliberate creative
decision, not folded into this bug-fix list.
