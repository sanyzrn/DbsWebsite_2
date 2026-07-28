# Testimonials / social proof

Attributed quotes and outcome statements. Each file is `content/testimonials/<id>.json`.

There is **no** per-item detail route — published entries render in the Testimonials
section (just above Contact). Leave this folder empty until a real entry exists;
the section is **not rendered at all** when there are zero published testimonials
(no empty-state box — more honest for a trust signal).

Do not invent quotes, names, or outcomes.

## Schema

| Field | Notes |
|-------|--------|
| `id` | Stable kebab-case id — **must match** the filename (`<id>.json`) |
| `quoteType` | `"direct"` \| `"outcome-statement"` |
| `quote` | `{ fa, en }` — required, non-empty in both locales for both quote types |
| `attribution` | `{ fa, en }` — e.g. role + industry, or a real name+role when permitted |
| `relatedProjectSlug` | Optional project `slug` when the proof relates to a specific engagement |
| `status` | `"published"` \| `"draft"` — only `published` appears in the UI |

### quoteType

- **`direct`** — a real spoken/written quote. Must be attributable and bilingual.
- **`outcome-statement`** — a factual result stated without a named quote voice
  (matches the site’s honesty principle). Styled distinctly from `direct`, but with
  **equal visual weight** — not a lesser fallback.

## Example

```json
{
  "id": "pharma-perf-review",
  "quoteType": "direct",
  "quote": {
    "fa": "…",
    "en": "…"
  },
  "attribution": {
    "fa": "مدیر محصول، صنعت داروسازی",
    "en": "Product manager, pharmaceutical industry"
  },
  "relatedProjectSlug": "dbspulse",
  "status": "draft"
}
```

## Validation

Build-time validation (`npm run validate:content`) enforces the schema above,
including non-empty bilingual quotes and optional `relatedProjectSlug` matching
a real project slug.

Runtime loading: `import.meta.glob` in `src/lib/testimonials.ts`.
