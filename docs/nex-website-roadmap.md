# Nex product website upgrade

Source brief: `nex-website-upgrade-prompt.md` supplied by the owner, 2026-10-23.
Work only on permanent `cursor-dev`; production remains `main` and the existing CI/FTPS deployment.
Each phase leaves a usable page. Recheck published app facts before writing new claims.

## Phase 1 — Published data and a usable install flow

- [x] Read website rules and inspect app/release sources.
- [x] Validate stable public releases; exclude draft, prerelease and untrusted URLs.
- [x] Commit a full release snapshot and a small landing-page snapshot.
- [x] Fetch both guides, changelogs, theme source and module availability from one pinned app revision.
- [x] Inspect guide image bytes/dimensions and add hash-based visual approval before publishing. Current sources are placeholders; use a clearly labelled HTML/CSS timeline illustration.
- [ ] Owner input: real Persian/English screenshots, then approve hashes and replace the illustration.
- [x] Refresh releases after hydration with ETag, a 20-minute cache, timeout, deduplication and failure backoff.
- [x] Hero version badge and a working download CTA.
- [x] Install ticket: conservative architecture choice, Universal fallback, file sizes, publication date, APK download count, available SHA-256, latest release notes and links to older releases.
- [x] Three Android store destinations remain disabled until real URLs are supplied. No iOS/Windows availability implied.
- [x] Document and prepare six-hour snapshot refresh and release dispatch. No writes to the app or releases repo.
- [x] Release parsing/cache tests and updated landing/a11y expectations.
- [x] Record final verification below before committing.

## Phase 2 — A distinctive landing experience

Keep the existing octopus, bilingual typography, independent Nex palette, intro and personal-note demo. Develop the story as one continuous day, rather than an unrelated collection of widgets.

- [x] Integrate product anchor navigation with the existing hero, octopus and light/dark palette.
- [x] Extend existing search experiment to 48 fictional bilingual notes, Persian normalization, highlights and measured response.
- [x] Interactive Persian/Gregorian calendar and ten accurate recurring dates (including month/year edges).
- [x] Privacy data-flow explorer: local capture, optional local/cloud AI, user-selected backup and isolated vault; include actual network exceptions.
- [x] Four-moment sticky-phone story, one short screen transition, manual controls on mobile and under reduced motion. All chapters remain in static HTML.
- [ ] Owner input remains: replace labelled phone illustrations with real guide screens after visual/hash approval. The story already consumes approved image metadata.
- Optional capture/widget additions deferred: the continuous-day story already supplies the capture moment; avoid adding a second unrelated visual system.

## Phase 3 — Complete bilingual product pages

- [x] Shared product navigation and routes `/nex/features`, `/nex/guide`, `/nex/changelog`, `/nex/download`, `/nex/themes`; FAQ as a page or landing section.
- [x] Source-backed bilingual feature data, category/search/status filters; module status from rollout.
- [x] Guide renderer: treat upstream Markdown as untrusted content, never executable MDX. Sticky contents, mobile contents sheet, scroll spy, Persian search, localized lazy images and report-error links.
- [x] Changelog timeline, exact release downloads, Persian/English fallback, search, permalinks and RSS/Atom.
- [x] “What changed since my version?” cumulative release summary (fifth required creative experience).
- [x] Generate `themes.json` from Dart presets. All actual themes, seed/surface colours, textures and honest labelled previews; page-scoped try-on with light/dark controls.
- [x] FAQ and actual app Privacy; upstream has no separate Terms document, disclosed without inventing one; no invented pricing, testimonials or store URLs.
- [x] Competitor comparison omitted: the pinned app snapshot supplies no verified competitor comparison, and an unsupported comparison adds little to this phase.

## Phase 4 — Integration and release verification

- [x] Extend prerender, sitemap, canonical/hreflang, command palette and URL checks for every route. Included with Phase 3 to keep new routes usable.
- [x] Per-page OG/SoftwareApplication/FAQ structured data where factual.
- [x] Complete guide refresh delivery, generated theme data and content schema checks. Included with Phase 3.
- [x] Complete separate main-only production refresh and exact CI-artifact FTPS deployment; development snapshots never merge/promote code.
- [x] PWA/offline coverage and bounded GitHub runtime caching; never precache GitHub responses.
- [x] Lazy-load heavy demos/galleries; check bundle, contrast, keyboard use and reduced motion.
- [x] All required repository checks and actual mobile/desktop, FA/EN, light/dark visual review.
- [x] Report the five creative experiences implemented and remaining owner inputs.

## Phase 1 verification

Verified on 2026-10-23:

- `npm run typecheck`, `npm run lint`: pass.
- `npm test -- --run`: 53 files / 252 tests pass, including release/cache cases and bilingual product-copy parity.
- `NEX_DATA_OFFLINE=1 npm run build`: pass; 54 prerender routes. Online strict snapshot refresh also completed successfully.
- `npm run check:dist`: pass, 56 HTML files / 86 valid JSON-LD blocks.
- `npm run check:bundle`: pass; initial JS 78.6 KiB gzip against 90 KiB ceiling.
- Browser preview: Persian light hero/download ticket, narrow-screen expanded asset list, English dark ticket and locale/theme controls visually inspected. Native disclosures and download anchor navigation work in the development preview.
- Static PWA inspection: manifest present, both Nex locale HTML files included in generated service-worker precache, no GitHub API response URL precached; emitted JS relative imports resolve.
- **Not passed here:** `check:a11y` could not start because Playwright's Chromium was absent; the browser download returned an invalid/truncated archive. `check:pwa` could not connect from the executor to the supervised preview (loopback refused / forwarded endpoint reset). The production preview rendered static content but reported failed dynamic imports through the preview transport, while all referenced emitted modules exist; production hydration is therefore unverified. Development-preview hydration worked. The new timeline illustration was also checked after discovering that upstream guide images are placeholders. Re-run production browser/PWA/accessibility gates in CI before merging.

The cron/dispatch workflow becomes active only after it reaches the default branch. No release-repo changes, default-branch promotion or production deploy were performed. Phase 1 completion does not mean the full brief is complete.

## Phase 2 implementation and verification

Implemented on 2026-10-23:

- Story: morning capture → noon search → evening recurrence → night vault. Desktop IntersectionObserver work is scoped to wide screens and disconnected on resize/unmount; manual buttons work at every width. Reduced motion removes the screen transition and sticky behaviour. All four chapters are prerendered.
- Search: `content/nex/search-demo.json` contains 48 fictional FA/EN notes. No visitor data, storage or network call is involved. Matching folds Arabic/Persian letter and numeral variants, diacritics and half-spaces; highlights map back to the original displayed text. The measured duration is explicitly a browser-demo measurement, not an app benchmark.
- Calendar: device-local today is read only after hydration; UTC-noon date-only arithmetic and `Intl` Persian/Gregorian calendars avoid DST drift. Ten monthly occurrences include today where applicable. Missing days clamp to month end without losing the requested day in later months. The demo creates no notification or actual reminder. Space is reserved before the live calendar arrives; dates are also readable as an ordered, keyboard-scrollable list.
- Privacy: five selectable data routes, native network-details disclosure and links to the app's actual privacy policy. Reviewed app revision `6a653a3620c18e68af37fdf3bcce3c7d78ae052a`, including `apps/client/assets/privacy/{fa,en}.md`, guide, AI context and backup/vault implementation. Ordinary backups are not described as fully encrypted. The previous absolute “nothing leaves” aside was replaced with a narrower offline-capture/search statement.
- Real screenshot input is still outstanding. Both illustrated phone treatments say so; no placeholder image is passed off as a real app screen. `product.json` supplies the approved-image replacement hook.

Verification:

- Full suite: 54 files / 265 tests pass with two workers. Earlier runs hit different 5-second page-test timeouts. Hero/download test queries were scoped to their own sections, retaining the same assertions and timeout. The final focused rerun passes all 50 landing/experience tests with one worker.
- Final TypeScript, lint and copy parity pass. Clean offline-snapshot build passes (54 prerender routes); `check:dist` passes (56 HTML files / 86 JSON-LD blocks). `check:bundle` passes: initial JS 78.6/90 KiB gzip, HTML 15.5/80 KiB and first paint 450.6/1480 KiB.
- Final `check:a11y` cannot launch: the Playwright Chromium executable is missing. This is a blocked check, not a pass. No browser-download retry was made after Phase 1's truncated archives. The HTTP PWA gate remains blocked by the previously observed supervisor networking restriction.
- Development browser: Persian light story and manual night selection, Gregorian day-31 recurrence (ten dates), English cloud-AI explanation, English dark search with original-text highlights inspected. Production browser, actual narrow viewports and full axe/PWA gates remain unverified in this environment because of the Phase 1 preview/Chromium limitations; the extended `check:a11y` now exercises the new controls at 1440/820/320px in both languages/themes when Chromium is available.
- The merged Phase 1 main CI run `40015585494` completed successfully. This is not a Phase 2 CI result; CI runs on PR/main, not a push to `cursor-dev`.

No new dependencies, production deployment, app-repo changes or extra branch were introduced. The fifth planned creative experience (version comparison) remains in Phase 3.

## Phase 3 implementation and verification

Implemented on 2026-10-24:

- Seven independent bilingual pages: features, guide, changelog, download, themes, FAQ and app privacy. Shared Nex navigation, locale counterparts and command-palette destinations. Other products retain their own shells.
- Four-story scroll-snap carousel with native touch scrolling, desktop pointer drag, RTL-aware arrow/Home/End controls, manual buttons, reduced motion and inert inactive slides. The owner-requested four real screenshots still require input/visual approval; existing CSS illustrations are explicitly labelled.
- AI-off mode contains a quiet stack of three prepared note/voice/photo examples inside the same reserved canvas. Switching states does not access the visitor note, invoke AI or send requests.
- 33 curated bilingual feature entries with category/search/status filtering. Only Cycle is available; 12 other module cards read availability from rollout metadata and remain marked soon.
- Nineteen guide chapters, Persian-folding search, scroll spy, sticky contents/current chapter, native mobile contents dialog and source report links. Build-time Markdown parsing emits an allowlisted data AST, removes HTML and unsafe links, never executes MDX and only renders visually approved local images. Image paragraphs use valid block markup to avoid hydration mismatches.
- All 134 actual public stable releases (2.2.2 through 0.6.0): safe rich notes, source dates, exact-version APKs, English fallback label, search, pagination, stable hash permalinks and locale RSS. Unreleased/prerelease changelog sections cannot create fake release entries. Runtime summaries preserve the full saved asset archive.
- Version bridge selects the visitor's installed version, accumulates subsequent releases/change bullets and links directly into the archive. This completes the fifth planned creative experience.
- Fourteen actual Dart theme presets, source seed/surface colours, lightweight SVG texture interpretations, light/dark controls and temporary Nex-only try-on. Text/accent contrast is tested in both modes. The try-on is not persisted and resets when leaving Nex; it never changes portfolio accent settings.
- Eleven source FAQ answers and the app's actual bilingual privacy policy. MIT code license is linked separately. No separate upstream Terms document exists; the page discloses this. No invented pricing, endorsements or comparison claims.
- Page imports now begin on navigation rather than eagerly downloading every route. SSR/tests explicitly preload modules; the full existing suite verifies other routes continue to render.
- Generated content and RSS participate in the existing scheduled snapshot refresh on cursor-dev. Hosting/deployment remains unchanged; automatic production promotion is still Phase 4.

Verification: full pre-final suite 55 files / 281 tests passed; an additional page integration suite passes 10 tests covering both locale SSR, guide search, deep release permalinks and theme isolation. Typecheck/lint and the clean offline build pass; 68 routes prerender. `check:dist` passes with 70 HTML files and 100 JSON-LD blocks. `check:bundle` passes (80.1/90 KiB initial JS, 453.3/1480 KiB first paint). Final rerun: 56 files / 291 tests pass, TypeScript and lint pass. After incorporating the concurrent scheduled snapshot refresh 0edb7f6, a clean build and dist/bundle checks pass again (80.2 KiB initial JS).

Development browser: Persian story layout and a short RTL mouse drag advancing to slide 2; AI on/off with the restored three-note stack; full archive/old-version selection; Persian guide; English source-theme preview/temporary try-on inspected. The real mobile touch gesture and production hydration still require the CI/browser checks. `check:a11y` is blocked by the missing Playwright Chromium executable; `check:pwa` is blocked by executor-to-supervisor loopback refusal. These are not passing checks. The a11y gate now covers nine additional product layouts/locales at 1440/820/320px, AI-off content and containment of active carousel content. No browser-download retry was made.

Earlier work confirmed complete: main CI 40021961359 and deployment 40022449021 succeeded for the reviewed dependency merge. This is not a Phase 3 CI/deployment result. Phase 3 remains on cursor-dev for review.

## Phase 4 — integration and final handoff

Implemented on 2026-10-24:

- Sixteen page-specific FA/EN share cards, generated with source vector branding and local fonts, plus factual FAQPage data from the eleven visible answers. No analytics added.
- Four three-step guide paths as native disclosures and chapter anchors. They work without JavaScript and add a useful starting point to the full guide.
- Found and fixed an existing offline defect: raw Workbox imports were being copied into the final worker. The worker is now bundled as a classic script, with production constants, before precache injection. Apache extensionless product routes and revisioned offline/404 fallbacks also resolve correctly.
- Public releases use a narrowly scoped anonymous runtime cache (3 successful responses / 20 minutes); no remote response in precache. Admin/API/PHP navigation exclusions remain. All product locale HTML/code remains available offline after worker installation. Share-card images avoid eager PWA download.
- Main-only six-hour production refresh reuses the full CI gate and existing FTPS hosting. Deploy consumes only the corresponding verified artifact, checks provenance/current main/no version downgrade, skips unchanged output and never merges cursor-dev automatically. Existing site-specific FTPS sync isolation is preserved.
- CI also runs on cursor-dev pushes, enabling validation without opening an unrequested PR. Browser coverage includes real touch/mouse story input, all gallery palettes in light/dark, mobile contents and installed-worker offline FA/EN guide search. Responsive review images are retained as a CI artifact.
- Heavy guide/archive/theme code remains in separate route chunks. A new 190 KiB gzip ceiling covers the complete Nex landing dependency graph, alongside the existing global bundle budgets; full route-data imports into the landing are rejected.

Local verification: TypeScript/lint pass; 57 files / 298 tests pass. Clean offline build prerenders 68 routes. Dist validates 70 HTML files, 100 JSON-LD blocks and all 16 share-card dimensions. PWA artifact checks pass 31/31; global initial JS stays 80.2/90 KiB gzip. Development browser inspected the Persian dark short paths and native opening; localized share art was inspected directly. CI is the final browser gate because this container lacks Chromium; do not infer browser success from static checks. Main phase-3 CI 40064969099 and hosting deploy 40065295077 succeeded before this phase.

Five required creative experiences are complete: searchable fictional notes with Persian folding; accurate dual-calendar recurrence; privacy data-flow explorer; four-moment day carousel (revised to owner-requested drag/swipe); cumulative changes since an installed version. Additional work includes 14 source-theme try-ons, three prepared AI-off cards, short guide paths and editorial share cards.

Remaining owner inputs: real Persian/English screenshots and visual/hash approval; actual Android store URLs. Optional publisher dispatch must be added in the app/release publishing job only by separate authorization; six-hour production polling already covers updates after these workflows are merged. No separate app Terms source exists, and no unsupported pricing/comparison claim is added. Changes to the new production pipeline become active only after the owner merges this phase into main.

Phase 4 browser follow-up: touch contexts now explicitly verify that the decorative eyes do not chase a mouse; fine-pointer contexts retain their gaze/reduced-motion assertions. Real approved story images disable native image dragging so mouse drags remain carousel gestures.

Phase 4 final review checks text against page, card and tinted surfaces in every actual theme, and clears guide filters before following a short-path chapter. The landing dependency budget runs before prerender removes the private Vite manifest. Offline checks wait for the hydrated 19-chapter guide before exercising search. Responsive CI captures were inspected in Persian/English, light/dark and 320/1440px.
