# Project content

Canonical source for portfolio projects. Each file is `content/projects/<slug>.json`.

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
| `image_url` | HTTPS URL or `null` (binaries stay on hosting, not in git) |
| `mock` | Optional UI screenshot key (presentation-only) |
| `caps` | Optional `{ fa, en }` capability lists |
| `year` | Optional string, e.g. `"2025"` — omit when unknown |
| `durationMonths` | Optional positive number — omit when unknown |
| `teamSize` | Optional string, e.g. `"Solo"` / `"Team of 3"` — omit when unknown |
| `clientType` | Optional `{ fa, en }` anonymized client context — omit when unshareable |
| `links` | Optional `[{ label: { fa, en }, href }]` public repo/demo links only |

Omit optional case-study metadata rather than inventing values. The detail page renders only
populated fields.

The static site loads these files at build time via `import.meta.glob` in `src/lib/projects.ts`.
The PHP admin panel under `admin/` publishes this same shape into the repo via the GitHub API
(see `admin/README.md`). Do **not** use Decap CMS.
