# Nex: a day of notes

## Product website upgrade — Phase 1

The current page has a published-version badge, upcoming Android market installs, an honestly labelled HTML/CSS timeline illustration and links to older release notes. `ReleaseDownload.tsx` receives the same refreshed data as the hero badge; its styles are scoped in `release-download.css`. Direct APK files, checksums and sideloading instructions are not displayed.

`content/nex/latest.json` is the small first-render snapshot; `releases.json` keeps the full archive for future product pages. Both guides, changelogs, module rollout, theme source and guide-image metadata are refreshed by `scripts/fetch-nex-data.mjs`. See `content/nex/README.md` for caching, offline builds and the scheduled refresh/optional publisher dispatch. `docs/nex-website-roadmap.md` tracks all four phases.

Only Cafe Bazaar, Myket and Google Play are shown as upcoming store destinations. App Store and Microsoft Store were removed because the product source explicitly says only Android is published. No store link is invented. `NEX_APK` has been replaced with validated release data. Upstream guide images are themselves placeholders, so `TimelinePreview.tsx` shows a labelled illustration; real app screenshots now live in the gallery under the hero. The interactive story below continues to share the same locale/theme state and build pipeline.

Nex owns `/nex/`, its seven product subpages and their `/en` counterparts. It uses the existing React router, locale/theme context, Vite build, static prerender, sitemap and Apache/FTPS workflow. No independent project or deployment was added.

The page is now a wide Nex world: an oversized bilingual hero, an orbital octopus with illustrative notes, and three chronological chapters. Desktop notes follow an asymmetric connected path, with a sticky day navigator. Mobile becomes a readable single-column chronology. The latest owner brief explicitly lifts the narrow-column and no-hero constraints.

The hero's native radios bring text, voice or a checklist to the foreground. The local note persists as you type; Enter folds it into a captured card, Shift+Enter adds a line, and Edit reopens it. IME composition is respected, and the captured state restores across visits/locales without changing the storage key. A separate search example demonstrates Persian letter/digit normalisation entirely in memory; English has its own coffee example and LTR result. A native private-vault disclosure opens a CSS door within reserved caption space, so opening/closing does not move later content. The header wordmark and footer anchor to the actual page top, above the masthead. The release ticket and upcoming Android stores live in a dedicated section after the timeline; the final timeline CTA points down to it. The AI switch is off by default and activates a local, animated thought-to-steps illustration, with three prepared examples and an explicit demo caption. It runs no model and reads no visitor notes. Voice remains a labelled visual example; it does not record or pretend to play audio. No accounts, requests or data collection were added.

Continuous CSS motion plays automatically, with no playback control, and follows the system reduced-motion preference. The masthead contains only the wordmark (smaller on mobile), locale link and theme control. Voice text, search feedback, note editing/capture and the AI examples use reserved space; long captured notes scroll inside their card so following content stays in place. Chapter navigation uses normal anchors and an optional IntersectionObserver for the active-day indicator; there is no scroll-jacking. Cards remain readable without JavaScript, and the existing prerendered page stylesheet remains authoritative.

- Copy / metadata / store destinations: `src/lib/nex.ts` (`NEX_COPY.fa`, `NEX_COPY.en`, `NEX_STORES`). Release data: `content/nex/latest.json` and `useNexReleases.ts`. Hero / chapter copy and the illustrative search normaliser are in `src/lib/nexExperience.ts`.
- Composition: `src/pages/NexLandingPage.tsx`; all page styles and animation names are scoped in `src/pages/nex-landing.css`.
- Images: `content/nex/product.json` records guide-image dimensions, hashes and approval. Only hashes listed after visual verification in `verified-images.json` are published under `public/images/nex/guide/`. No current placeholder is shown as an app screenshot.
- Type: the site's local Vazirmatn plus local Inter Latin variable subset in `public/fonts/nex/`. Inter source: Fontsource `@fontsource-variable/inter` 5.3.0, bundled under the SIL OFL in `Inter-OFL.txt`. No CDN requests.
- Interactive note: `LocalNote.tsx`. Every edit writes one bounded note (max 1200 characters) to `nex-landing-note-v1` in localStorage. No requests, account or phone sync. Delete removes the key. Invalid data is ignored; denied/full storage leaves a usable in-memory note and honestly reports visit-only storage. Loading happens after hydration so server and first client output match.
- Native `<details>` work without JavaScript. The demo textarea is disabled until enhancement; a `<noscript>` message explains this. Other notes are prerendered HTML.
- The blue palette is independent of portfolio accents. Theme control uses the existing theme preference; a system-theme CSS fallback also works without JavaScript.
- SEO uses the existing `PageMeta` and prerender resolver, with reciprocal hreflang, a scoped 1200 × 630 OG asset and factual SoftwareApplication JSON-LD. No prices, ratings or invented store URLs. Only Android stores are listed; other platforms are not advertised as published.

## Living connections

The hero octopus keeps the existing vector artwork. Its two eyes follow a fine pointer within the scene (one requestAnimationFrame at most), and its blue arm breathes. Selecting a native capture radio by keyboard or touch sends a blue reaching thread toward that card. Touch does not chase a pointer. Reduced motion disables gaze, rotation and drawing animation; its preference can change while the page is open.

Capturing with Enter connects the personal note to a fixed-height, decorative network in its own card and replaces the hero's example text with a bounded two-line preview. The full note remains readable in its scrollable card. Editing/deleting restores the example and dormant network; a captured note restores across visits/locales. This is a visual connection, not AI analysis, automatic tagging, cloud sync or a request. The AI demonstration still never reads the personal note.

`TimelineThread.tsx` is a desktop-only enhancement above 820px. Two independent curved paths connect the facing edges of the Today and Yesterday note cards through the open gutter, with small ports, a soft blue stroke and a reading-position pen. Chapter headings, privacy copy and the origin artwork have no crossing line. Layout offsets plus each card’s rotation keep docking stable during arrival animation. Every card, including AI, has an opaque background on a layer above the line. Mobile hides the SVG and releases its observers, frames and scroll/resize listeners; returning to desktop rebuilds the connections. Passive scroll is coalesced to one frame and suspended offscreen. Resize/font completion remeasures; reduced motion shows completed static connections. Without JavaScript the decorative SVG is hidden. All listeners and observers are released on unmount.

## Remaining owner inputs

1. Supply actual Android marketplace URLs when available: Cafe Bazaar, Myket and Google Play. Set the matching `NEX_STORES` href; the rest stay disabled.
2. Optional: activate the publisher dispatch documented in `content/nex/README.md` after the workflow reaches the default branch. Polling/runtime release refresh do not require a publisher-side change.

The octopus (`NexMark.tsx`, with both eyes) and the wordmark (`NexWordmark.tsx`, with its dot) are the final brand artwork, drawn from `docs/brand/nex_logo.svg` and `nex_logo_type.svg` in the Nex repository; the path data lives once in `brand.ts`. Their outlines follow `currentColor` and the blue parts `--nx-mark-accent`. The share image `public/images/nex/og.jpg` carries the same wordmark and the app icon.

Loading intro (`NexIntro.tsx`, `nex-intro.css`): the app's splash screen retold, about 2.9 s. It opens on the two eyes (the blue one blinks), the octopus grows out from between them, six pieces of a day are pulled in along threads to its arms, `nex` rises letter by letter with its blue stroke and dot, the tagline follows, and the page opens from the eyes. It plays once per browser session via `html.nex-intro-play`, set by the pre-paint script in `index.html` (never under reduced motion, never without JavaScript, never on client-side navigation); a tap or any key skips it. It is decorative and `aria-hidden`.

`StoreLinks.tsx` renders three Android markets with real, self-hosted brand marks. Native disabled buttons show به‌زودی / Coming soon while their configured URL is `#`; actual URLs activate links automatically. Nex installation is available only through these markets; the release ticket and changelog do not expose APK downloads. Artwork sources remain documented under `public/images/nex/stores/`.

## Validate / publish

`npm run typecheck`, `npm run lint`, `npm test -- --run`, `npm run build`, `npm run check:dist`, `npm run check:pwa`, `npm run check:bundle`. Browser accessibility checks use the repository's `npm run check:a11y` when Chromium is available. Both Nex locales are scanned in light/dark at 1440, 820 and 320px. The same gate checks capture-mode switching, local-note Enter/Shift+Enter capture, restore/edit/deletion, locale search matching, document-coordinate layout stability during voice/vault disclosures, search match/miss/reset, short/long note capture/edit/delete and every AI state, keyboard AI switching and changing examples, exact back-to-top navigation, horizontal layout containment and static no-JS light/dark content.

Keep using the permanent `cursor-dev` branch and its PR to `main`. Merge through the existing GitHub Actions workflow; do not upload `dist/` manually or deploy a second website.

## Phase 3 product pages

`NexPageFrame`, `NexNavigation` and `nex-product.css` provide shared navigation and an independent product shell. Copy in `nexProductCopy.ts` is composed into `NEX_COPY` for FA/EN parity. Safe content contracts, release merging and date formatting live in `nexContent.ts`; the build-only parser is `shared/nex-content.mjs`. Heavy guide/history data stays in route chunks. Theme previews use `nexThemePreview.ts` and context scoped to the Nex route family, never global accent variables or persistence.

`ScreenGallery` replaced the illustrated four-moment `DayStory`: ten real screens of Nex 2.3.5 (`public/images/nex/screens/`, 540 and 1080 px WebP, lazy and not precached) in a native scroll-snap rail with arrows and a language filter, the page language first, every caption in both languages (`src/lib/nexScreens.ts`). `NexHighlights` follows it with twelve features at a glance (`src/lib/nexHighlights.ts`); the features page holds the full list. `VersionBridge` adds cumulative changes since an installed version. See the roadmap for source facts and verification.

## Final integration

`GuidePaths` supplies four native short-path disclosures (three source chapter links each), usable without JavaScript. `generate-nex-og.mjs` builds sixteen bilingual 1200×630 editorial share cards from the actual vector brand, local fonts and page headings; every route uses its own localized card. FAQ structured data uses the same eleven visible source answers. No rating, price, store URL or testimonial is invented.

The worker is compiled into a standalone classic script before manifest injection. `check:pwa` statically verifies all Nex pages are precached, no GitHub payload is precached, and imports/Node globals cannot break the worker. The Chromium gate adds native desktop drag/mobile touch, both gallery modes, installed-worker offline guide search and mobile contents. For publishing and production refresh see `content/nex/README.md`.
