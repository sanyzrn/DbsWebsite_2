# Nex: a day of notes

Nex replaces only `/nex/` and `/en/nex/`. It uses the existing React router, locale/theme context, Vite build, static prerender, sitemap and Apache/FTPS workflow. No independent project or deployment was added.

The page itself is a narrow timeline: a pinned download note, six notes today, two yesterday, and the maker on day one. Motion is a brief octopus greeting, pin settling and waveform, plus progressive CSS view-timeline settling. No motion hides content; reduced-motion disables it. Voice is an illustrative waveform with a real disclosure for its text, not a simulated audio player.

- Copy / metadata / store destinations: `src/lib/nex.ts` (`NEX_COPY.fa`, `NEX_COPY.en`, `NEX_STORES`).
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
4. Supply the final octopus logo; replace the provisional `NexMark` artwork.

Download links marked `#` are explicitly disabled and show a visible pending-link explanation. When actual URLs are set they work normally.

## Validate / publish

`npm run typecheck`, `npm run lint`, `npm test -- --run`, `npm run build`, `npm run check:dist`, `npm run check:pwa`, `npm run check:bundle`. Browser accessibility checks use the repository's `npm run check:a11y` when Chromium is available.

Keep using the permanent `cursor-dev` branch and its PR to `main`. Merge through the existing GitHub Actions workflow; do not upload `dist/` manually or deploy a second website.
