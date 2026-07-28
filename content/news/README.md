# Daily Digest content

Curated short pointers to external sources. Each file is `content/news/<id>.json`.

There is **no** per-item detail route — the `/news` list page is the only surface.
Do not invent items; leave this folder empty until a real curated entry exists.

## Schema

| Field | Notes |
|-------|--------|
| `id` | Stable kebab-case id — **must match** the filename (`<id>.json`) |
| `date` | Required ISO `YYYY-MM-DD` |
| `title` | `{ fa, en }` — required, non-empty |
| `summary` | `{ fa, en }` — required short summary |
| `sourceUrl` | Required absolute URL of the external source |
| `sourceName` | Required human-readable source name (visible “Source: …” link) |
| `curatedByAI` | Boolean — when `true`, the list shows a calm “Curated by AI” badge |
| `tags` | String array (may be empty) |

Every item **must** include `sourceUrl` and `sourceName`. Build-time validation
(`npm run validate:content`) fails if either is missing — citation-only, consistent
with the rest of this project.

## Example

```json
{
  "id": "2026-07-19-example-source",
  "date": "2026-07-19",
  "title": { "fa": "…", "en": "…" },
  "summary": { "fa": "…", "en": "…" },
  "sourceUrl": "https://example.com/article",
  "sourceName": "Example Source",
  "curatedByAI": true,
  "tags": ["AI"]
}
```

## Automation

No scheduling or summarization pipeline ships with this scaffold. Future automation
should write correctly-shaped JSON into this folder; the frontend list page needs
no change when that happens.

Runtime loading: `import.meta.glob` in `src/lib/news.ts`.
