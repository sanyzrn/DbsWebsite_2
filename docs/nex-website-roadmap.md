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

- [ ] Refine hero, navigation and real phone imagery in light/dark.
- [ ] Extend existing search experiment to 40–60 local sample notes, Persian normalization, highlights and measured response.
- [ ] Interactive Persian/Gregorian calendar and ten accurate recurring dates (including month/year edges).
- [ ] Privacy data-flow explorer: local capture, optional local/cloud AI, user-selected backup and isolated vault; include actual network exceptions.
- [ ] Scroll story with real guide screens, one main motion, mobile and reduced-motion alternatives.
- [ ] Optional three-second capture illustrations and a six-icon home-screen preview if they improve the composition.

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
