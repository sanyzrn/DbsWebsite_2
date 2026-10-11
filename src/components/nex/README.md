# Nex: a day of notes

Nex replaces only `/nex/` and `/en/nex/`. It uses the existing React router, locale/theme context, Vite build, static prerender, sitemap and Apache/FTPS workflow. No independent project or deployment was added.

The page is now a wide Nex world: an oversized bilingual hero, an orbital octopus with illustrative notes, and three chronological chapters. Desktop notes follow an asymmetric connected path, with a sticky day navigator. Mobile becomes a readable single-column chronology. The latest owner brief explicitly lifts the narrow-column and no-hero constraints.

The hero's native radios bring text, voice or a checklist to the foreground. The local note still persists without a Save action. A separate search example demonstrates Persian letter/digit normalisation entirely in memory, and a native private-vault disclosure opens a CSS door. Voice remains a labelled visual example; it does not record or pretend to play audio. No accounts, requests or data collection were added.

Continuous CSS motion has an explicit pause/resume button and follows reduced-motion preferences. Chapter navigation uses normal anchors and an optional IntersectionObserver for the active-day indicator; there is no scroll-jacking. Cards remain readable without JavaScript, and the existing prerendered page stylesheet remains authoritative.

- Copy / metadata / store destinations: `src/lib/nex.ts` (`NEX_COPY.fa`, `NEX_COPY.en`, `NEX_STORES`). Hero / chapter copy and the illustrative search normaliser are in `src/lib/nexExperience.ts`.
- Composition: `src/pages/NexLandingPage.tsx`; all page styles and animation names are scoped in `src/pages/nex-landing.css`.
- Images: `public/images/nex/PLACEHOLDERS.md` documents final file names and dimensions.
- Type: the site's local Vazirmatn plus local Inter Latin variable subset in `public/fonts/nex/`. Inter source: Fontsource `@fontsource-variable/inter` 5.3.0, bundled under the SIL OFL in `Inter-OFL.txt`. No CDN requests.
- Interactive note: `LocalNote.tsx`. Every edit writes one bounded note (max 1200 characters) to `nex-landing-note-v1` in localStorage. No requests, account or phone sync. Delete removes the key. Invalid data is ignored; denied/full storage leaves a usable in-memory note and honestly reports visit-only storage. Loading happens after hydration so server and first client output match.
- Native `<details>` work without JavaScript. The demo textarea is disabled until enhancement; a `<noscript>` message explains this. Other notes are prerendered HTML.
- The blue palette is independent of portfolio accents. Theme control uses the existing theme preference; a system-theme CSS fallback also works without JavaScript.
- SEO uses the existing `PageMeta` and prerender resolver, with reciprocal hreflang, a scoped 1200 × 630 OG asset and factual SoftwareApplication JSON-LD. No prices, ratings or invented store URLs.

## Remaining TODOs

1. Supply the actual Cafe Bazaar app URL; replace the `#` in `NEX_STORES.bazaar.href` and remove its TODO marker.
2. Supply the actual Myket app URL; replace the `#` in `NEX_STORES.myket.href` and remove its TODO marker.
3. Supply the real app screenshot and enable `NEX_SCREENSHOT.ready`.

The octopus (`NexMark.tsx`) and the wordmark (`NexWordmark.tsx`) are the final brand artwork, drawn from `docs/brand/nex_logo.svg` and `nex_logo_type.svg` in the Nex repository. Their outlines follow `currentColor` and the blue part `--nx-mark-accent`. The share image `public/images/nex/og.jpg` carries the same wordmark and the app icon.

Download links marked `#` are explicitly disabled and show a visible pending-link explanation. When actual URLs are set they work normally.

## Validate / publish

`npm run typecheck`, `npm run lint`, `npm test -- --run`, `npm run build`, `npm run check:dist`, `npm run check:pwa`, `npm run check:bundle`. Browser accessibility checks use the repository's `npm run check:a11y` when Chromium is available. Both Nex locales are scanned in light/dark at 1440, 820 and 320px. The same gate checks capture-mode switching, local-note persistence/deletion, Persian search matching, native-vault disclosure, horizontal layout containment and static no-JS light/dark content.

Keep using the permanent `cursor-dev` branch and its PR to `main`. Merge through the existing GitHub Actions workflow; do not upload `dist/` manually or deploy a second website.
