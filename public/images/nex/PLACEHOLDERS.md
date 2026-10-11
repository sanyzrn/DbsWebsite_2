# Nex image slots

| File | Size | Content | Placement |
| --- | --- | --- | --- |
| `timeline-fa.webp` | 1080 × 1920 px | A real Nex timeline with promotional sample notes, voice and checklist. Keep the app's original colours. | Today's photo note, both locales; responsive, uncropped. |
| `og.jpg` | 1200 × 630 px | Included: typographic Nex social-sharing artwork. No ratings, testimonials or screenshot claims. | Open Graph / Twitter metadata, both locales. |

The screenshot is deliberately absent. A labelled, hatched placeholder is rendered instead of a broken image. Place the real file here, then set `NEX_SCREENSHOT.ready = true` in `src/lib/nex.ts`. It uses a lazy-loading `<img>` with fixed intrinsic dimensions and descriptive alt text.

The octopus (`src/components/nex/NexMark.tsx`) and the wordmark (`NexWordmark.tsx`) are the final brand artwork from the Nex repository; `og.jpg` uses the same wordmark and the app icon.

Five real, self-hosted marketplace marks are included in `stores/`; see `stores/SOURCES.md` for provenance. They are not image placeholders. All five Nex store destinations are currently labelled Coming soon.
