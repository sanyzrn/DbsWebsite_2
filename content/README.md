# Project content

Canonical source for portfolio projects. Each file is `content/projects/<slug>.json`.

Articles live separately under [`content/articles/`](./articles/README.md) as per-locale MDX
(`<slug>.fa.mdx` / `<slug>.en.mdx`).

Daily Digest items live under [`content/news/`](./news/README.md) as bilingual JSON
(`<id>.json`) — citation-only pointers with required `sourceUrl` + `sourceName`.

## Field names (authoritative)

| Field | Notes |
|-------|--------|
| `id` / `slug` | Stable identifiers (usually identical) |
| `name`, `subtitle`, `desc` | `{ fa, en }` |
| `problem`, `approach`, `result` | `{ fa, en }` case-study fields (may be empty) |
| `role` | `{ fa: string[], en: string[] }` |
| `tech`, `tags` | Shared string arrays |
| `status` | `"production"` \| `"concept"` |
| `featured` | boolean |
| `order` | Sort key — **use `order`, not `display_order`** |
| `image_url` | Site path (e.g. `/images/projects/<slug>.webp`), HTTPS URL, or `null`. Prefer optimized files from `scripts/optimize-image.mjs` under `public/images/projects/` |
| `mock` | Optional UI screenshot key (presentation-only) |
| `caps` | Optional `{ fa, en }` capability lists |
| `year` | Optional string, e.g. `"2025"` — omit when unknown |
| `durationMonths` | Optional positive number — omit when unknown |
| `teamSize` | Optional string, e.g. `"Solo"` / `"Team of 3"` — omit when unknown |
| `clientType` | Optional `{ fa, en }` anonymized client context — omit when unshareable |
| `links` | Optional `[{ label: { fa, en }, href }]` public repo/demo links only |
| `updatedAt` | Optional ISO date `YYYY-MM-DD` — stamp when substantively updating; drives sitemap `<lastmod>` |

Omit optional case-study metadata rather than inventing values. The detail page renders only
populated fields.

The static site loads these files at build time via `import.meta.glob` in `src/lib/projects.ts`.
Edit JSON directly (same file-based workflow as articles). The PHP admin under `admin/` is
**deactivated/standby** — see [`admin/README.md`](../admin/README.md). Do **not** use Decap CMS.
