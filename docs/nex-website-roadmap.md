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

- [ ] Shared product navigation and routes `/nex/features`, `/nex/guide`, `/nex/changelog`, `/nex/download`, `/nex/themes`; FAQ as a page or landing section.
- [ ] Source-backed bilingual feature data, category/search/status filters; module status from rollout.
- [ ] Guide renderer: treat upstream Markdown as untrusted content, never executable MDX. Sticky contents, mobile contents sheet, scroll spy, Persian search, localized lazy images and report-error links.
- [ ] Changelog timeline, exact release downloads, Persian/English fallback, search, permalinks and RSS/Atom.
- [ ] “What changed since my version?” cumulative release summary (fifth required creative experience).
- [ ] Generate `themes.json` from Dart presets. All actual themes, seed/surface colours, textures and honest labelled previews; page-scoped try-on with light/dark controls.
- [ ] FAQ and actual app Privacy/Terms; no invented pricing, testimonials or store URLs.
- [ ] Competitor comparison only if current, primary evidence supports every included criterion; otherwise omit with explanation.

## Phase 4 — Integration and release verification

- [ ] Extend prerender, sitemap, canonical/hreflang, command palette and URL checks for every route.
- [ ] Per-page OG/SoftwareApplication/FAQ structured data where factual.
- [ ] Complete guide refresh delivery, generated theme data and content schema checks.
- [ ] Finish automatic production rebuild integration through existing deployment; Phase 1 workflow only updates `cursor-dev`, never promotes it.
- [ ] PWA/offline coverage and bounded GitHub runtime caching; never precache GitHub responses.
- [ ] Lazy-load heavy demos/galleries; check bundle, contrast, keyboard use and reduced motion.
- [ ] All required repository checks and actual mobile/desktop, FA/EN, light/dark visual review.
- [ ] Report the five creative experiences implemented and remaining owner inputs.

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
