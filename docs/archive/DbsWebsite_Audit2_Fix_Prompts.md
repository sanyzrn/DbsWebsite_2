# DbsWebsite_2 — Combined Audit Fix Prompts (Round 3, synthesizing two independent audits)

Sources: "DbsWebsite_2 Comprehensive Project Audit" (72/100) and a second independent
"Comprehensive Technical & Content Audit" (8.2/10) — both dated 2026-07-19. Sections 1-20
below already cover every finding the two audits share. Sections 21+ are new, cover ONLY
findings unique to the second audit that were not already addressed.

Excluded on purpose from both audits: GAP-04/pricing-engagement-model (already declined
earlier), and every "surprise"/strategic product idea from both reports (interactive
problem-map, citation-only AI assistant, capability-evidence graph, bilingual PDF, PR
preview deployments, live grounded AI demo, before/after slider, practice graph, cinema
reading mode, command-palette concierge, dynamic OG images, public stats dashboard) — these
are new products/features, not fixes. Two are genuinely worth a separate conversation
whenever you're ready: the **live AI demo** ("Ask about my work") and the **serverless
contact pipeline with notifications** (section 24 below is a lighter version of the latter).

Each numbered section is one independent, copy-pasteable prompt covering a cluster of
related findings.

---

## 1. Real HTTP 404s + security headers + canonical redirect (host-agnostic)

Covers: FUN-01, SEO-03, SEO-01, SEO-02, SEC-01

```
The current hosting provider is temporary and may change, so implement these three fixes in
a way that's easy to port to any static host (Vercel, Netlify, Cloudflare Pages, a plain
Nginx/Apache server, etc.) — keep the underlying logic in the app/build itself wherever
possible, and isolate the small amount of genuinely host-specific config into one clearly
labeled file/section so switching hosts later only means touching that one place.

1. True 404 status codes: unmatched routes currently fall back to rendered content with
   HTTP 200 (soft 404). Whatever host is in use, configure it so any path not matching a
   prerendered route/asset serves dist/404.html (and dist/en/404.html for English paths)
   WITH an actual 404 status code — this is typically a "rewrite unmatched paths to
   404.html, but respond with status 404" rule (Vercel: a `routes`/`rewrites` entry in
   vercel.json; Netlify: a custom `_redirects` rule with a `404` status code; Cloudflare
   Pages: a `_redirects`/`_headers` file; plain Nginx: an `error_page 404 /404.html;`
   directive). Implement whichever syntax matches the CURRENT host (check what's actually
   configured/deployed right now), but put this config in a clearly commented section (or a
   dedicated file, e.g. `hosting/` folder) noting "host-specific deployment config — replace
   this file's contents with the equivalent for a new host if migrating" so it's obvious
   what needs porting later. Add `<meta name="robots" content="noindex, follow">` in the
   prerendered 404.html content itself (check src/pages/NotFoundPage.tsx / the seo.ts
   "notFound" entry already has this — if not, add it there) — this part is host-independent
   and doesn't need to be redone on migration.

2. Security headers: add the following response headers to every route, using whatever
   header-configuration mechanism the current host provides (a `headers` block in
   vercel.json, a `_headers` file for Netlify/Cloudflare Pages, an `add_header` directive
   for Nginx, etc.) — again, isolate this in the same clearly labeled host-config location
   as point 1:
   - `Content-Security-Policy` — start with a reasonably strict policy allowing self,
     the site's own font/style sources, and any third-party origins actually in use
     (Formspree if configured, any analytics later added) — document each allowed source
     with a comment explaining why it's needed.
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy` — deny unused features (camera, microphone, geolocation, etc.)
   - `X-Frame-Options: DENY` (or rely solely on CSP's frame-ancestors if preferred)
   Do NOT add `Strict-Transport-Security` (HSTS) yet — hold off until the canonical domain
   (dbsgraphic.ir) is confirmed stable and TLS is fully verified on whichever host ends up
   being permanent, since HSTS mistakes are hard to reverse quickly and HSTS also becomes
   a migration hazard if it's set before the final host is locked in.

3. Canonical domain redirect: once dbsgraphic.ir is confirmed reachable with valid TLS, add
   a permanent redirect from whatever temporary hosting-provider subdomain is currently live
   (e.g. dbs-website-2.vercel.app, or its future equivalent on a different host) to the
   canonical domain, so there is exactly one publicly indexed hostname — again using
   whichever redirect mechanism the current host provides. Until the custom domain is
   verified working, keep SITE_URL pointed at whichever host is actually reachable (do not
   point canonical/OG/sitemap URLs at a domain that doesn't resolve — verify this with an
   actual request before changing SITE_URL). Since SITE_URL is already a single environment
   variable (per the earlier domain-configuration fix), this part requires no code change at
   all when migrating hosts — only the env var value changes.

Add a deployment-level test (can extend scripts/check-urls.mjs or a new script) verifying:
an unknown path returns HTTP 404, the response includes noindex, and the canonical domain
in SITE_URL actually resolves over HTTPS before treating a build as ready to promote to
production — write this test to hit the live URL over plain HTTP, so it works identically
regardless of which host is serving that URL.
```

---

## 2. Content integrity pipeline (block incomplete content from shipping)

Covers: CON-01, CON-02, SEO-04, CODE-04, CODE-09

```
Currently, `_todo` flags, "details soon"/TBD placeholder text, and concept-status projects
can all end up in the production sitemap and public routes with no build-time gate. Fix
this end-to-end:

1. Add runtime/build-time validation of every content/projects/*.json file using Zod (or
   Valibot) — define a schema matching the current TypeScript type, and run it as a build
   step (e.g. in scripts/generate-seo-files.mjs or a new scripts/validate-content.mjs called
   from the `build` npm script before `vite build`). Fail the build with a clear, specific
   error message if any file fails schema validation.

2. Add a content-maturity field, e.g. `maturity: "draft" | "review" | "published" |
   "archived"`, alongside the existing `status: "production" | "concept"` field (keep both —
   `status` describes what kind of thing it is, `maturity` describes its publication
   readiness). Default existing real projects to `maturity: "published"` and the three
   concept placeholders to `maturity: "draft"`.

3. Block the build (fail with a clear error, not a warning) if any project with
   `maturity: "published"` contains the string `_todo`, `TBD`, "details soon", "جزئیات
   به‌زودی", or any other placeholder marker in problem/approach/result/desc fields —
   scan for these strings specifically in published content. Projects with
   `maturity: "draft"` are allowed to contain these markers (that's the point of the draft
   state) but must be excluded from production output per points 4-5 below.

4. Exclude any project with `maturity !== "published"` from: the generated sitemap.xml
   (update scripts/generate-seo-files.mjs's `loadProjectSlugs()` to filter by maturity), the
   home page teaser, and the full /projects grid's default view — draft projects should
   only be reachable via a direct URL (for internal review) and should render with
   `<meta name="robots" content="noindex">` on their individual page.

5. This directly resolves the current state: dbsai.json, dbstools.json, hesabyar.json, and
   the three concept-*.json files currently contain `_todo` markers. Set their `maturity`
   to `"draft"` for now (removing them from public listing/sitemap until Saeed fills in
   verified content and flips them to `"published"`), rather than leaving them publicly
   listed with placeholder text.

Add a test confirming: a project JSON with `maturity: "published"` and a `_todo` string
fails the build, and a project with `maturity: "draft"` is excluded from the generated
sitemap.
```

---

## 3. Case-study content accuracy and richness

Covers: CON-03, CON-05, CON-06

```
Two related content-quality issues in project case studies:

1. DbsPulse's `result` field currently describes delivering architecture documents and a
   build specification, while its `status`/`role` fields imply full implementation and
   deployment — this is a real contradiction a careful reader would notice. Reconcile it:
   either (a) change DbsPulse's `status` to reflect that it's a specification/architecture
   deliverable rather than a deployed system (if that's factually accurate), or (b) if it
   was actually implemented and deployed, rewrite the `result` field to describe the
   deployed outcome instead of just the planning artifacts. Confirm with Saeed which is
   factually correct before choosing — do not guess.

2. Extend the project content schema (content/projects/*.json + the matching TypeScript
   type) with these additional fields, recommended by the audit's case-study structure:
   `year` (string, e.g. "2025"), `durationMonths` (number, optional), `teamSize` (string,
   e.g. "Solo" or "Team of 3"), `clientType` (fa/en string, e.g. "Pharmaceutical company,
   internal HR department" — anonymized where needed), and an optional `links` array
   (label + href) for any real public repo/demo link. Render these as a compact metadata
   row on the project detail page (src/pages/ProjectDetailPage.tsx) near the top, below the
   title — small, factual, not decorative. Leave any field empty/omitted (not fabricated)
   where the real information isn't available or shareable, and render the metadata row
   gracefully with only the fields that are actually populated.

Do not invent years, durations, or team sizes for any project — only add these fields where
Saeed can confirm the real value; leave them blank otherwise.
```

---

## 4. JSON-LD script-safe escaping

Covers: SEC-05

```
In scripts/prerender.mjs, `buildJsonLd`'s output is inserted into the page via
`JSON.stringify(block)` with no additional escaping of characters that are unsafe inside an
inline <script type="application/ld+json"> tag — specifically `<`, `>`, `&`, U+2028 (line
separator), and U+2029 (paragraph separator). If any authored content (project name,
description, etc.) ever contains a literal `</script>` sequence or these Unicode line
separators, it could break out of the script tag or cause parsing issues in some engines.

Fix: replace the raw `JSON.stringify(block)` call in the `buildHeadTags` function with a
hardened serializer that escapes `<` as `\u003C`, U+2028 as `\u2028`, and U+2029 as `\u2029`
in the resulting JSON string before it's embedded. Add a regression test with a project
whose name/description deliberately contains a `</script>` substring, confirming the
rendered HTML does not contain an unescaped closing script tag in the middle of the JSON-LD
block.
```

---

## 5. Admin panel security hardening bundle

Covers: SEC-02, SEC-03, SEC-04, SEC-07, SEC-08, SEC-09, SEC-12

```
Harden the PHP/MySQL admin panel (admin/) across several related areas — all single-admin-
appropriate, no multi-user complexity added:

1. MFA / restricted access (SEC-02): since this is a single-admin tool, the simplest
   effective fix is to put the entire /admin path behind an additional layer beyond
   password auth — either (a) require TOTP (e.g. via a small PHP TOTP library) as a second
   factor after password login, or (b) restrict /admin access at the webserver level to a
   specific IP allowlist or require a client-side VPN/Cloudflare Access-style gate if
   Saeed's hosting supports it. Implement (a) if no infra-level option is available —
   document the setup step (scanning a QR code once) in admin/README.md.

2. Default to PR-based publishing (SEC-03): change GitHubPublisher.php's default
   `PUBLISH_MODE` from `direct` to `pull-request`, so admin edits create a PR against main
   rather than committing straight to main. Keep `direct` mode available as an explicit
   opt-in env setting, clearly documented as higher-risk.

3. Session timeouts (SEC-04): add both an idle timeout (e.g. 30 minutes of inactivity logs
   the session out) and an absolute session lifetime (e.g. 8 hours regardless of activity)
   to Auth.php. Additionally, require re-entering the password (not just an active session)
   immediately before any `publish.php` action — treat publishing as a sensitive action
   needing fresh authentication, similar to how bank/payment UIs re-confirm before
   high-stakes actions.

4. Combined rate limiting (SEC-07): extend the existing IP-based login_attempts throttling
   in Auth.php to also throttle per-username, independent of IP — so an attacker rotating
   IPs against one known username is still slowed down, not just an attacker hammering one
   IP against multiple guessed usernames.

5. Image dimension limits (SEC-08): in ImageHandler.php, in addition to the existing 5MB
   file-size cap, add explicit maximum width/height checks (e.g. reject anything above
   6000x6000px) and a decoded-memory estimate check (width × height × 4 bytes per pixel)
   before passing the file to GD/Imagick for re-encoding, rejecting anything that would
   require an unreasonable amount of memory to process.

6. Upload storage safety (SEC-09): confirm (and add an automated check, e.g. a script that
   runs after deployment and attempts to fetch a known path) that admin/uploads/ genuinely
   cannot execute PHP (the existing .htaccess `php_flag engine off` approach from earlier —
   verify it's still present and add an equivalent documented Nginx location-block example
   in admin/README.md for hosts using Nginx instead of Apache, since .htaccess only works on
   Apache).

7. GitHub token scope (SEC-12): document in admin/README.md exactly what scope the
   configured Personal Access Token must have (repository-specific, Contents: Read and
   write only — already specified when this was built) and add a note recommending
   migration to a GitHub App with repository-scoped installation permissions if/when GitHub
   deprecates broader PAT usage, plus a reminder to rotate the token periodically (e.g.
   every 90 days) with the rotation date noted somewhere Saeed will actually see it (a
   comment in config/.env.example is fine).

Add PHPUnit tests (new, since none currently exist per the audit — see also the separate
CODE-05 finding, which can be addressed together with this if convenient) covering: session
idle/absolute timeout behavior, the per-username rate limit, and the image dimension
rejection logic.
```

---

## 6. Small correctness bugs — locale switching and contact form value storage

Covers: FUN-02, FUN-03

```
Two small, unrelated logic bugs:

1. In src/lib/app.tsx (or wherever `setLang()`/the language-toggle handler lives), the
   locale switch currently builds the new URL by concatenating pathname + hash + search,
   which produces an incorrect URL structure (valid order is pathname, then search/query,
   then hash/fragment). Fix the navigation call to use React Router's structured location
   object — `navigate({ pathname: newPathname, search: currentSearch, hash: currentHash })`
   — instead of manual string concatenation, so query parameters and hash fragments both
   survive a language switch in the correct order.

2. In src/components/Contact.tsx, the project-type `<select>` currently uses the translated
   display label as the stored `value` for each `<option>` (`value={type}` where `type` is
   already-translated text). This means switching language while the form is open can leave
   a previously-selected option pointing at a label that no longer exists in the new
   language's option list, silently resetting or breaking the selection. Fix: introduce
   stable, language-independent IDs for each project type (e.g. `"ai-integration"`,
   `"web-app"`, `"branding"`, `"other"` — matching whatever categories already exist), store
   the ID in component state and in the submitted form data, and use a lookup into
   `t.contact.types` (or wherever the translated labels live) only for the visible label
   text — never for the stored value.

Add a regression test for each: switching language preserves query params and hash intact
in the correct URL order, and switching language with a project type already selected keeps
the same logical selection (verified by ID, not by label) after the switch.
```

---

## 7. Contact form reliability, honesty, and a dedicated route

Covers: FUN-04, FUN-05, FUN-06, FUN-10, SEC-10, CON-10

```
Several related improvements to src/components/Contact.tsx's reliability and honesty:

1. Require a real production form endpoint: fail the production build (or at minimum log a
   loud build-time warning) if `VITE_FORMSPREE_ID` (or whatever env var configures the real
   submission backend) is unset — the current silent fallback to a truncated `mailto:` link
   should be a deliberate, visible exception, not the default behavior when a config value
   is simply missing.

2. Fix the success-state wording: when the mailto fallback path is used (user's email client
   opens instead of a real server submission), change the confirmation message from implying
   the inquiry was sent to something accurate like "Email client opened — please send the
   pre-filled message to complete your inquiry" (localized fa/en), and do NOT clear/reset the
   form fields in this fallback case, since the message hasn't actually been delivered yet.

3. Add request timeout and cancellation: wrap the real (non-mailto) form submission fetch
   call with an `AbortController` and a reasonable timeout (e.g. 15 seconds), showing a clear
   "Taking longer than expected — try again" state if it fires, instead of leaving the UI
   indefinitely in a "sending" state if the network stalls.

4. Add basic anti-spam protection: a honeypot field (a visually hidden input that legitimate
   users never fill in; reject submissions where it's non-empty) plus a simple timing check
   (reject submissions completed in under ~2 seconds, a common bot tell). This doesn't need
   to be sophisticated — just enough to cut down on basic automated spam.

5. Add a dedicated `/contact` (and `/en/contact`) route rendering the same form content
   currently only reachable via the `/about#contact` modal/anchor — keep the modal as a
   quick-access shortcut from other pages, but make the full page the shareable, indexable,
   analytics-trackable canonical destination for contact-intent traffic. Update Nav.tsx,
   FloatingQuickNav.tsx, and any other internal links accordingly.

6. Update the privacy policy content (wherever Privacy page content lives in i18n.ts) to
   explicitly name Formspree (or whichever processor is actually configured) as the
   third-party processor handling form submissions, with a brief note on purpose (spam
   filtering/delivery) and where to find their own privacy/retention policy — do not leave
   the processor unnamed.
```

---

## 8. Accessible names for project visuals + About image alt text

Covers: A11Y-03, A11Y-08

```
Two related missing/inadequate accessible-name issues:

1. In src/components/Projects.tsx (and wherever the same card markup is used on the
   ProjectDetailPage), the generated mock-visual illustrations for each project are
   currently separate from the project title link, and some visual links have no
   meaningful accessible name of their own. Fix: either (a) wrap the mock visual AND the
   title inside one single `<Link>` with an `aria-label` set to the project's full name
   (e.g. "View DbsPulse case study"), or (b) if the visual and title must remain separate
   links for layout reasons, add an explicit `aria-label` to the visual's link
   (e.g. `aria-label={`${project.name} preview`}`) rather than leaving it unnamed. Mark the
   decorative parts of each mock illustration (background shapes, icons that don't convey
   unique information) with `aria-hidden="true"` — the accessible name should come from the
   link's label, not from screen readers trying to parse decorative SVG/DOM content.

2. In src/components/About.tsx, the studio image's alt text currently just repeats the page
   title. Replace it with a real, specific, localized description of what the image
   actually shows (e.g. "Saeed at his design desk" / "سعید پشت میز کار طراحی‌اش" — adjust to
   what the actual photo depicts), or if the image is purely decorative/atmospheric rather
   than informative, use `alt=""` explicitly rather than a generic non-description.
```

---

## 9. Contact form error association and live regions

Covers: A11Y-04, A11Y-05

```
In src/components/Contact.tsx's inquiry form:

1. Field-level errors currently aren't programmatically associated with their inputs. For
   each field with a validation error: add `aria-invalid="true"` to the input, generate a
   stable id for its error message (e.g. `ct-name-error`), and reference it from the input
   via `aria-describedby` (combining with any existing describedby value if one is already
   present for hint text). Ensure the error message element itself has that matching id and
   is only rendered/associated when an error actually exists for that field.

2. Progress, success, and error status messages (the "sending", "message received"/success
   confirmation, and any top-level submission failure message) currently aren't exposed as
   live regions. Add `role="status"` (with `aria-live="polite"`) to the sending/success
   state container, and `role="alert"` (which is inherently assertive) to any top-level
   submission failure message, so screen reader users are notified of state changes without
   needing to re-navigate to find them.

3. On submission failure, move focus to either the top-level error message or the first
   invalid field, so keyboard/screen-reader users land somewhere relevant immediately
   rather than staying wherever focus happened to be.

Add a Testing-Library test confirming: an invalid field gets `aria-invalid` + a properly
linked `aria-describedby` error message, and the success/error containers have the correct
live-region roles.
```

---

## 10. Command palette — extend the existing focus-trap pattern

Covers: A11Y-06

```
src/components/Contact.tsx and src/components/Nav.tsx already have a working focus-trap
pattern (a `useFocusTrap` hook in src/lib/useFocusTrap.ts, combined with `inert` on
background content and focus restoration to the triggering element). Apply the exact same
pattern to src/components/CommandPalette.tsx, which currently has none of it:

1. Import and use the existing `useFocusTrap(dialogRef, open)` hook (reuse, don't
   reimplement) on the palette's dialog container.
2. Apply `inert` to the rest of the app's content while the palette is open, matching how
   Contact.tsx already does it.
3. Track the element that had focus before the palette opened (however it's triggered —
   keyboard shortcut, button, etc.) and restore focus to it on close.
4. Lock body scroll while open, matching the existing pattern.
5. Keep all of the palette's own existing behavior (the combobox ARIA pattern, arrow-key
   navigation, existing open/close triggers) exactly as it is — this is purely adding the
   missing modal-containment behavior on top of what's already there.

Add a test confirming: opening the palette traps Tab within it, and closing it (Escape or
selecting an option) restores focus to whatever opened it.
```

---

## 11. Project filter accessibility and empty-state behavior

Covers: A11Y-07, FUN-07

```
In src/components/Projects.tsx's filter chips:

1. The filter buttons don't expose which one is currently selected to assistive technology.
   Add `aria-pressed={filter === tag}` to each filter chip button (a toggle-button pattern
   is more accurate here than a radio-group, since it's a simple pressed/not-pressed
   filter chip — use `aria-pressed` rather than `role="radio"`/`aria-checked` unless the UI
   is later redesigned as an actual radio group).

2. When a filter produces zero matching projects, the grid currently silently falls back to
   showing all projects — which reads as if the filter didn't work at all. Fix: show a
   localized empty state instead ("هیچ پروژه‌ای در این دسته نیست" / "No projects in this
   category yet") with a "Clear filter" button that resets `filter` back to the default/all
   state — do not silently ignore the user's filter selection.

Add a test confirming: selecting a filter with no matches shows the empty state (not the
full unfiltered grid), and the previously active filter chip has `aria-pressed="true"`.
```

---

## 12. Contrast, text size, and touch-target audit

Covers: A11Y-01, A11Y-02, A11Y-09, A11Y-13, UX-10

```
Several related "small but real" accessibility/readability issues, best tackled together
since fixing one (contrast) often requires touching the same CSS custom properties as
another (text size):

1. Color-contrast automation: the current axe-based check (scripts/check-a11y.mjs) has
   contrast rules disabled (a common workaround since JSDOM can't compute real rendered
   contrast). Add a real browser-based contrast check using Playwright + axe-core (this
   overlaps with the browser-testing work in the next section — implement once, use for
   both) running against the actual rendered pages in both light and dark themes and both
   languages.

2. Once real contrast testing is in place, manually verify every text/background color
   token pairing currently used for the accent color (`--accent`/`--accentdark`) and any
   "tertiary"/muted text tokens at their actual used font sizes — adjust any foreground
   color that fails WCAG AA (4.5:1 for normal text, 3:1 for large text 24px+/19px+bold)
   against its background in either theme. Keep changes minimal — nudge the specific failing
   token's lightness/saturation rather than redesigning the palette.

3. Several places in the UI render meaningful text (metadata, tags, chip labels) at 9-11px.
   Increase these to a 12-14px practical minimum wherever the text conveys real information
   (project tags, metadata rows, filter chips) — purely decorative micro-text (if any
   exists) can stay smaller, but anything a user needs to actually read should not go below
   12px.

4. Audit touch targets across the site (filter chips, tag pills, small icon-only buttons,
   the carousel dots from the earlier round of fixes) and ensure every interactive element
   has at least a 24×24 CSS pixel hit area (WCAG 2.2 minimum), with primary mobile actions
   (nav items, CTA buttons) targeting 44×44px where feasible — use invisible padding to
   expand hit areas without changing visual size, consistent with how the carousel dots
   were already fixed in an earlier pass.

Add before/after screenshots or a short written note in a PR description listing which
specific token/size changes were made, since this kind of change is easy to under- or
over-correct without a visual record.
```

---

## 13. Real browser-level testing infrastructure (accessibility, performance, deployment)

Covers: A11Y-10, A11Y-11, PERF-07, CODE-10

```
Current automated testing has real gaps the audit correctly identifies: axe checks run only
against 3 static Persian routes in JSDOM (no English, no dark theme, no interactive states,
no real rendering), there's no Lighthouse/browser performance gate, and there's no
deployment-level end-to-end testing.

Add a Playwright-based test suite (new, e.g. tests/e2e/) covering:
1. axe-core accessibility scans against every major template (home, projects index, project
   detail, about, contact, privacy, terms, 404) × both languages (fa/en) × both themes
   (light/dark) — a matrix, not just 3 static pages. Include interactive states: mobile menu
   open, contact modal open, command palette open, a project filter applied.
2. A Lighthouse CI run (or Playwright + `playwright-lighthouse`) against the home page and
   one project detail page, in both languages, enforcing minimum scores (Performance ≥ 85,
   Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 95 — adjust thresholds based on the first
   real run's baseline rather than guessing).
3. Deployment-level E2E smoke tests run against the actual deployed preview/production URL
   (not just the local build) after each deploy: the canonical domain resolves and matches
   SITE_URL, an unknown path returns real HTTP 404, the OG image URL returns 200, the
   sitemap URL returns 200 and contains no draft/concept project URLs (ties to the content
   pipeline fix in section 2), and the contact form's real endpoint (not mailto) is reachable.
   Write these as plain HTTP requests against a URL (passed in as an env var/parameter), not
   tied to any specific hosting provider's API — this keeps the tests portable across hosts.

Wire the Playwright suite into .github/workflows/ci.yml as an additional job (can run in
parallel with the existing typecheck/lint/test/build job), and the deployment-level smoke
tests as a separate job or workflow triggered post-deploy — trigger this however fits the
CURRENT host's deploy-notification mechanism (a deploy webhook, a scheduled job hitting the
production URL a few minutes after a known deploy time, or a manual workflow_dispatch run) —
since this trigger mechanism is the one genuinely host-specific piece here, keep it isolated
and clearly commented so it's a quick swap if the hosting provider changes later.
```

---

## 14. Code-splitting: routes, Projects.tsx, and the command palette

Covers: PERF-01, PERF-02, PERF-08, CODE-01

```
Three related bundle-size issues, all fixed by the same underlying technique (code
splitting):

1. src/App.tsx currently imports every page (Home, Projects, ProjectDetail, About, Privacy,
   Terms, NotFound) synchronously/eagerly. Convert each route's page component to
   `React.lazy()` + wrap the route tree in a `<Suspense>` boundary with a lightweight,
   on-brand loading fallback (respecting reduced-motion for any loading animation). This
   means a home-page visitor no longer downloads the code for About, legal pages, project
   detail, and contact in their initial bundle.

2. src/components/Projects.tsx currently combines project card rendering, the filter grid,
   ALL project mock-visual components, and (per mode) full case-study detail rendering in
   one large file. Split it into focused modules: extract each project's mock visual into
   its own lazily-imported component (e.g. src/components/project-mocks/PulseMock.tsx,
   KeepMock.tsx, etc., each dynamically imported only when that specific project's card is
   about to render — or, simpler and often sufficient: dynamically import the whole
   mocks module only when `mode === "full"` or when a card scrolls into view via
   IntersectionObserver, since mocks are the heaviest part). Keep the card layout, filter
   logic, and grid/carousel rendering in Projects.tsx itself, but move the actual mock
   visual implementations out into their own lazily-loaded chunk(s).

3. src/components/CommandPalette.tsx currently loads for every visitor even though it's a
   power-user feature triggered by a keyboard shortcut. Lazy-load it — only import/mount the
   component when the trigger shortcut (Cmd/Ctrl+K) is first pressed or the palette's
   trigger button is first interacted with, not as part of the initial app shell.

Verify with a bundle analysis (e.g. `vite-bundle-visualizer` or similar) that the initial
JS chunk size drops meaningfully after these changes, and confirm the existing
`check:bundle` CI script's thresholds still make sense given the new chunking (adjust
thresholds if the initial chunk is now smaller than before, tightening the budget rather
than leaving old, looser numbers in place).
```

---

## 15. Font weight trimming and expanded performance budgets

Covers: PERF-04, PERF-05

```
1. Currently Vazirmatn is imported at weights 300-900 (all available weights) and IBM Plex
   Mono at four weights (400/500/600/700), via @fontsource packages. Audit the actual CSS
   font-weight values used across src/index.css and all components, and only import the
   specific weights actually referenced (e.g. if only 400/600/700/800 of Vazirmatn are ever
   used in practice, drop the rest from the @fontsource import). If Bricolage Grotesque's
   variable font already covers the used weight range efficiently, leave it as-is (variable
   fonts don't have the same "one file per weight" cost problem).

2. scripts/check-bundle-size.mjs currently only checks the main JS and CSS file sizes. Add
   budget checks for: total font payload (sum of all self-hosted font files actually shipped
   for the default/first-visit locale), total initial HTML size for the home page, and
   total initial transfer size across HTML + critical CSS + critical JS + fonts combined
   (a reasonable target: well under 500KB total for first meaningful paint resources,
   adjust based on the real numbers this check reveals on first run). Fail CI if any budget
   is exceeded, matching the existing pattern of check:bundle already in the CI workflow.
```

---

## 16. Responsive image pipeline for future real screenshots + upload caching

Covers: PERF-09, PERF-10

```
Two related image-performance items, both preparing for the eventual replacement of
generated mock visuals with real project screenshots:

1. There's currently no responsive-image pipeline — when real screenshots are added later
   (replacing the mock illustrations), they risk becoming the single biggest performance
   regression if handled naively. Set up a pipeline now, before that content exists: any
   image referenced via a project's `image_url` field should be processed (at upload time in
   the PHP admin's ImageHandler.php, which already re-encodes uploads) to generate multiple
   width variants (e.g. 480/768/1200/1600px) in both WebP and a JPEG/PNG fallback, with
   correct intrinsic width/height stored alongside the URL so the frontend can render
   `<img srcset sizes>` correctly and avoid layout shift. Update the project content schema
   to store the set of generated variant URLs (or a predictable naming convention the
   frontend can construct from one base URL) rather than a single flat `image_url` string.

2. Admin-uploaded images currently have no defined caching policy. Serve them with
   content-hashed filenames (e.g. include a short hash of the file content in the filename,
   already partially achievable since ImageHandler.php re-encodes and could generate the
   hash at that point) and long-lived, immutable Cache-Control headers (e.g.
   `Cache-Control: public, max-age=31536000, immutable`) configured at the webserver level
   for the uploads directory — since content-hashed names mean a changed image gets a new
   URL rather than needing cache invalidation on an old one.
```

---

## 17. Maintainability bundle — i18n structure, route generation, docs, PHP quality gates

Covers: CODE-02, CODE-03, CODE-06, CODE-07, CODE-08, CODE-12

```
Several related maintainability improvements — not urgent individually, but worth doing
together since they touch overlapping "how the project is organized" concerns:

1. Split src/lib/i18n.ts (currently one large monolithic dictionary) into per-locale,
   per-namespace files (e.g. src/lib/i18n/fa/nav.ts, src/lib/i18n/fa/contact.ts, etc., or a
   simpler per-namespace-only split if per-locale-per-namespace is overkill) and add a
   build-time check that fails if any key present in the `fa` dictionary is missing from
   `en` or vice versa (key-parity validation), catching incomplete translations
   automatically instead of relying on manual review.

2. Persian and English routes are currently manually duplicated (e.g. `/projects` and
   `/en/projects` defined separately). Generate the full route list from one shared,
   locale-aware route configuration/manifest (a single array of route definitions, each
   automatically producing both a `/path` and `/en/path` entry) consumed by React Router's
   route definitions, scripts/generate-seo-files.mjs, and scripts/prerender.mjs — currently
   these three places each have their own route-listing logic (this also addresses
   CODE-12's "SEO/sitemap/prerender/route logic spread across multiple scripts" — creating
   this one shared manifest is the fix for both).

3. Add ESLint coverage for scripts/*.mjs (currently excluded from lint per the audit) and a
   basic PHP quality gate in CI for admin/ — PHP_CodeSniffer or a syntax-only `php -l` check
   at minimum, PHPStan/Psalm static analysis if reasonable to add without excessive setup
   time. Add this as a new CI job alongside the existing frontend one.

4. Rewrite README.md's architecture section — it currently describes the project as a
   frontend-only SPA, which is no longer accurate given the prerendering pipeline and the
   separate PHP/MySQL admin. Document: the static-prerendered frontend, the content
   publishing flow (admin → GitHub Contents API → git → the hosting provider's git-based
   auto-deploy — name whichever provider is actually in use today, and note explicitly that
   this is expected to change and the doc should be updated when it does), the admin's
   separation from the public runtime, and where to find each piece (link to admin/README.md
   for admin-specific setup).

5. Introduce basic database migrations for the admin's MySQL schema (e.g. a simple
   numbered-SQL-file migration runner, or a lightweight tool like Phinx if Composer is
   already in use) instead of the current single schema.sql applied manually — so future
   schema changes (like the `maturity` field added in section 2 of this document) have a
   clear, versioned upgrade path.
```

---

## 18. SEO structured-data correctness

Covers: SEO-08, SEO-09, SEO-10, SEO-12

```
1. src/lib/seo.ts's `buildJsonLd` currently always adds a zero-price `Offer` to
   `SoftwareApplication` entries, which is misleading for projects that aren't actually free
   publicly available applications. Remove the automatic zero-price offer; only include an
   `offers` block when the project is factually a free, publicly usable application (add an
   explicit boolean field for this, e.g. `isPubliclyAvailable`, rather than inferring it).

2. The schema type (`SoftwareApplication` vs `CreativeWork`) is currently inferred from tag
   membership (checking for "Full-Stack"/"AI"/"Mobile"/"Desktop"/"Automation" tags), which is
   an unreliable signal — a project tagged "AI" isn't necessarily a schema.org
   SoftwareApplication. Add an explicit `schemaType` field to each project's content
   (`"SoftwareApplication" | "CreativeWork" | "Article"`) set deliberately per project rather
   than inferred, and use that field directly in `buildJsonLd`.

3. Add `BreadcrumbList` JSON-LD (plus a small visible breadcrumb UI component) to project
   detail pages: Home > Projects > [Project Name], reflecting the real navigation hierarchy.

4. Add factual `dateCreated`/`datePublished`/`dateModified` values to project JSON-LD —
   sourced from the `year` field added in section 3 of this document (dateCreated) and, if
   available, the file's git history or a manually maintained `updatedAt` field
   (dateModified) — never fabricate a date; omit the field if the real date isn't known.

Validate the resulting structured data with Google's Rich Results Test for at least one
project page and the home page after these changes.
```

---

## 19. Analytics/conversion tracking and uptime monitoring

Covers: GAP-01, GAP-08

```
Two lightweight, independent additions:

1. Add privacy-conscious analytics (a self-hosted or privacy-first provider like Plausible
   or Umami, consistent with earlier discussions about avoiding a cookie-consent-banner
   requirement) tracking a minimal, meaningful event set: project card/detail view (with
   project slug), CTA clicks (start-a-project, view-projects), contact form start and
   successful submission, and language/theme toggles. Disclose this analytics provider in
   the privacy policy content alongside the Formspree disclosure from section 7.

2. Add basic uptime and synthetic monitoring: an external uptime check (many free tiers
   exist, e.g. UptimeRobot, Better Uptime) pinging the canonical domain's home page, one
   project page, and the sitemap URL every few minutes, alerting Saeed by email if any of
   them go down or start returning non-200 statuses — catching canonical-domain outages or
   broken deploys before a visitor or Google does.
```

---

## 20. Small housekeeping

Covers: CODE-13, CON-09

```
Two trivial fixes, unrelated but both quick:

1. Add a LICENSE file to the repository root — since this is a personal portfolio and admin
   tool rather than an open-source library, an explicit "All rights reserved" notice (or a
   short custom notice Saeed prefers) is sufficient; the point is just removing the current
   ambiguity about reuse rights, not necessarily open-sourcing anything.

2. src/components/About.tsx (or wherever the About page content lives) still contains a
   leftover editorial placeholder comment from earlier development, per the audit. Find and
   either complete the narrative section it was marking, or remove the placeholder comment
   entirely if the section is already finished and the comment is just stale.
```

---

## Flagged for a decision, not auto-implemented

- **Testimonials / independent proof (GAP-02, UX-09)** — flagged as high-severity by this
  audit and by the earlier one. Not included as a prompt here since it needs real content
  (actual quotes, permissions, or verified outcome statements) that only Saeed can supply —
  say the word and I'll draft the section structure + placeholder-to-real-content workflow
  whenever real testimonials are ready to collect.
- **SEO-14 (dedicated service/topic pages)** and **CON-07 (English copy concreteness pass)**
  — both are real content-writing projects (new pages, or a full editorial pass), not quick
  code fixes — worth their own separate conversation when you're ready to tackle content
  rather than engineering.

---

## 21. Publish only changed files (efficiency + audit-trail cleanliness)

Covers: (2nd audit) B-6

```
admin/src/GitHubPublisher.php's publish() method currently iterates ALL projects and calls
putFile() for every one of them on every publish, regardless of whether that project's
content actually changed — even though previewDiff() already computes exactly which slugs
were added/changed/removed. Fix this:

1. Change publish() to only call putFile() for slugs present in the diff's `changed` and
   `added` arrays (reuse the same diff object previewDiff() already builds — don't
   recompute it separately).
2. Confirm removed slugs (diff['removed']) are still deleted via the Contents API delete
   endpoint exactly as they are now (this part is already correct).
3. Unchanged projects should result in zero GitHub API calls for that publish action.

This reduces noisy commit history, avoids unnecessary GitHub API rate-limit consumption, and
makes each commit's diff meaningful (only showing what actually changed) rather than
touching every project file on every save. Add a PHPUnit test (or extend whatever admin test
suite exists after the CODE-05/PHPUnit work from section 5) confirming: publishing with only
one project modified results in exactly one putFile call, not N calls for N total projects.
```

---

## 22. Small dead-code, notice, and metadata cleanup bundle

Covers: (2nd audit) B-2, B-3, B-4, B-7

```
Four small, independent cleanups:

1. Remove dead code: src/lib/seo.ts still exports a `@deprecated applyDocumentSeo` function
   left over from before PageMeta/prerender took over that responsibility. Grep the whole
   src/ tree to confirm nothing still imports/calls it, then delete the function entirely.

2. Contact modal status reset bug: in src/components/Contact.tsx, `status` is reset to
   "idle" when the modal is opened via its trigger button, but NOT when it's opened via a
   hash-based deep link (e.g. `#contact/start`) after a previous open ended in an error or
   success state — so a stale "error" or "delivered" banner can incorrectly reappear. Fix:
   move the `status` reset into whatever effect/handler responds to the hash-driven
   open/close transition, so any path that transitions the modal from closed → open always
   resets status to "idle" first.

3. Mailto truncation notice: `buildMailto()` currently silently trims long messages to stay
   under the ~1800-byte safe URL length, appending "…" with no user-visible indication. Add
   a visible notice when truncation occurs (e.g. "Your message was long and has been
   shortened — please confirm it sent in full, or use the direct email link below") and make
   sure the direct email address is always shown alongside this fallback path so the user has
   an alternative if truncation matters for their inquiry.

4. Add `twitter:site` / `twitter:creator` meta tags in src/lib/seo.ts's meta generation IF
   Saeed has an X/Twitter handle to attribute them to — if not, explicitly skip adding an
   empty/placeholder handle (don't invent one). Similarly, add any other real, existing
   professional profile URL to the JSON-LD `sameAs` array (currently listing GitHub and
   LinkedIn) — only add profiles that genuinely exist and are actively used.
```

---

## 23. SEO refinements — admin disallow, sitemap freshness, safe truncation

Covers: (2nd audit) S-1, S-2, S-4

```
Three small SEO hardening items:

1. Add `Disallow: /admin` and `Disallow: /*.php$` to public/robots.txt's generation logic
   (scripts/generate-seo-files.mjs), even though the PHP admin is intended to live on a
   separate host from the public static site — this is a cheap, defensive addition in case
   the admin ever ends up reachable under the same domain, and it costs nothing to include
   now.

2. Sitemap `lastmod` values: currently the sitemap has no per-URL last-modified date. Add an
   `updatedAt` field to each project's content JSON (set by the PHP admin whenever a project
   is edited — GitHubPublisher.php can stamp this automatically on save), and have
   scripts/generate-seo-files.mjs emit a real `<lastmod>` per project URL from that field.
   For static routes (home, about, etc.) without a natural "last updated" concept, either
   omit `lastmod` entirely or tie it to the last relevant content commit if that's easy to
   derive — don't fabricate a date for these.

3. Grapheme-safe description truncation: project meta descriptions currently use a raw
   `.slice(0, 155)`, which can cut mid-word and, more importantly for Persian text, mid-
   grapheme (breaking apart combined characters/ZWNJ sequences and producing garbled SERP
   snippets). Replace this with a truncation helper that (a) never cuts inside a Unicode
   grapheme cluster — use `Intl.Segmenter` (available in modern Node/browser runtimes) to
   segment by grapheme before truncating — and (b) truncates at the last whole word boundary
   at or before the character limit, appending "…" only when actual truncation occurred.
   Apply this helper everywhere a description is currently sliced (project pages, and any
   other page using the same truncation pattern).
```

---

## 24. Serverless contact-form proxy (optional architecture upgrade)

Covers: (2nd audit) SEC-5, and strengthens B-1/section 7 of this file

```
This is a slightly bigger change than the honeypot/timing-check anti-spam already specified
in section 7 — it's an architecture upgrade, worth doing if Saeed wants a materially more
robust contact pipeline rather than just patching the current direct-to-Formspree flow.

This assumes a hosting provider that supports serverless/edge functions (Vercel, Netlify,
Cloudflare Pages/Workers, etc. all support this in slightly different ways) — confirm the
current provider supports it before starting, since this section is naturally more coupled
to the hosting choice than the others in this document (a serverless function's runtime API
differs meaningfully between providers, unlike static file hosting/redirects/headers which
are conceptually similar everywhere). If a host change is likely soon, it may be worth
deferring this specific section until that's settled, to avoid rewriting the function for a
new provider shortly after building it — sections 1-23 of this document have no such
constraint and are safe to do regardless of hosting plans.

Add a serverless function (e.g. api/contact.ts, using whichever runtime the current hosting
provider offers — Vercel's Node runtime, Netlify Functions, or a Cloudflare Worker) that:
1. Receives the contact form submission instead of the client posting directly to
   Formspree's public endpoint.
2. Performs server-side validation of all fields (mirroring whatever client-side validation
   already exists), rejects the honeypot/timing-check failures from section 7 server-side
   (not just client-side, since client-side-only checks are trivially bypassed by a real
   bot), and only then forwards a validated submission to Formspree using a server-side
   environment variable for the Formspree endpoint — the public client bundle never contains
   the raw Formspree ID.
3. Returns a clear success/failure response the existing Contact.tsx UI can consume with
   minimal changes to its existing state machine (sending/success/error).
4. Optionally (only if Saeed wants it — flag as a nice-to-have, not required): send a
   notification (email via a transactional provider, or a Telegram/Slack webhook ping) to
   Saeed immediately when a new inquiry arrives, independent of whatever Formspree's own
   notification settings do — useful as a redundant "don't miss an inquiry" channel.

This is optional — the honeypot + timing-check fixes in section 7 alone meaningfully reduce
spam without this additional serverless layer. Only pursue this if Saeed wants a more
observable, self-owned contact pipeline rather than relying on Formspree as the sole layer
of validation.
```

---

## 25. Hero visual performance — SVG filter cost + typewriter idle behavior

Covers: (2nd audit) P-1, P-2

```
Two related Hero.tsx performance refinements:

1. HeroAtmosphere currently renders a live inline SVG filter chain (feGaussianBlur +
   feTurbulence fractalNoise) recalculated by the browser on every paint — feTurbulence in
   particular is known to be expensive to rasterize, especially on mobile GPUs. Replace the
   live filter with a pre-rendered approach: generate the grain/atmosphere texture once at
   build time as a small tiled WebP/PNG (or a lightweight, non-turbulence CSS gradient
   approximation), and use that as a background-image instead of a live SVG filter. If the
   exact organic grain look from feTurbulence is worth keeping, render it once to a canvas
   at build/dev time, export as an image asset, and ship the static image rather than the
   live filter computation. Additionally, apply `content-visibility: auto` to the atmosphere
   layer's container so the browser can skip rendering work for any part currently off-
   screen.

2. useTypewriter.ts's cycling timer currently keeps running indefinitely regardless of tab
   visibility, causing unnecessary re-renders/CPU-timer wakeups when the tab isn't visible.
   Add a `document.visibilitychange` listener that pauses the typewriter's interval/timeout
   while `document.hidden` is true, and resumes it when the tab becomes visible again. The
   existing `prefers-reduced-motion` handling (already correctly showing static text) stays
   exactly as-is — this is an additional, independent optimization for the animated case,
   not a replacement for it.
```

---

## 26. Small accessibility polish — decorative elements and bidi isolation

Covers: (2nd audit) A-2, A-4

```
Two quick accessibility polish items:

1. Audit every purely decorative visual element across the site (separator dots/dashes in
   the nav, the animated brand "dot" near the logo, ornamental icons that don't convey unique
   information beyond adjacent text) and confirm each has `aria-hidden="true"`. Most
   already do per earlier accessibility passes — this is a verification sweep, not a
   from-scratch implementation; fix any stragglers found.

2. Where Latin-script or numeral runs are embedded inside Persian (RTL) text outside of the
   already-correctly-handled email/phone fields (e.g. inline English project names, version
   numbers, or acronyms embedded in Persian sentences), wrap them in `<bdi>` (or apply
   `unicode-bidi: isolate` via CSS to the relevant inline elements) to prevent punctuation
   and numeral reordering artifacts in mixed-direction text. Scope this to spots where it's
   visually noticeable — a full-codebase mechanical wrap of every English word isn't
   necessary, focus on cases with adjacent punctuation/numbers where bidi reordering bugs
   are actually visible.
```

---

## 27. Quantified metrics field for case studies

Covers: (2nd audit) C-3 (extends section 3's case-study richness work)

```
In addition to the year/duration/team/clientType/links fields already specified in section 3
of this document, add an explicit `metrics: { fa: string; en: string }[]` array field to the
project content schema — a short list of quantified, factual outcome statements (e.g.
"−70% در زمان چرخه‌ی بازبینی" / "−70% review cycle time", "۳ واحد کسب‌وکار" / "3 business
units onboarded"). Render these as a small metrics strip/row on the project detail page,
visually distinct from the prose `result` field (e.g. a row of compact stat chips).

Hard rule, consistent with every other content field in this project: only add a metric
entry where Saeed can confirm the real number. Do not populate this field with invented or
estimated figures for any project — leave the array empty for projects where no verified
quantified outcome exists yet, and render nothing (no empty placeholder row) when the array
is empty.
```

---

## 28. Unify duplicated Workbox configuration

Covers: (2nd audit) Q-3

```
Runtime caching strategy and glob patterns for the service worker are currently defined
twice — once in vite.config.ts's VitePWA() config, and again in scripts/generate-sw.mjs —
kept in sync only by a code comment reminder, which is fragile. Extract the shared
`runtimeCaching` array and `globPatterns` array into one module (e.g.
scripts/workbox-shared-config.mjs, using plain JS/JSON so it can be imported by both an ESM
build script and vite.config.ts), and have both vite.config.ts and generate-sw.mjs import
from that single source instead of maintaining two copies. Add a comment at the top of the
shared file noting that this is the single source of truth for service-worker caching
behavior.
```

---

## Additional decision needed: how to handle concept/placeholder projects publicly

Both audits flag the three concept projects as diluting credibility (Audit 1: CON-01/SEO-04;
Audit 2: B-5/C-2), but the second audit suggests a different UX than the "hide from public
routes entirely" approach already specified in section 2 of this document. Two real options:

- **Option A (already specified in section 2):** Concept/draft projects are excluded from
  the sitemap, home teaser, and default `/projects` grid — reachable only via direct URL for
  internal review, marked `noindex`. Simple, safe, no visual design work needed.
- **Option B (the second audit's suggestion):** Keep concept projects publicly visible but
  move them into a clearly labeled, visually distinct "Explorations / Concepts" tab or
  section — separate from the main "Projects" grid, with explicit framing (e.g. "Early
  explorations — not yet shipped products") so a visitor understands the distinction
  without concepts being hidden.

Pick one before implementing section 2 (if not already done) — Option A is simpler and
lower-risk; Option B is more transparent and can even read as a strength ("I show my
early-stage thinking, not just polished output") if framed well, but requires a small amount
of additional page/navigation design work. Say which you prefer and I'll write the
corresponding prompt.
