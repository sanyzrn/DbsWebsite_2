# Articles content

Canonical source for long-form articles. Each locale is its own file:

```
content/articles/<slug>.fa.mdx
content/articles/<slug>.en.mdx
```

Prose differs naturally per language — do **not** force bilingual `{ fa, en }` fields like
project JSON. Keep slugs lowercase kebab-case and mirrored across locales when both exist.

## Frontmatter

| Field | Notes |
|-------|--------|
| `title` | Required |
| `description` | Required — meta description + card summary (~140–160 chars) |
| `date` | Required ISO `YYYY-MM-DD` (publication) |
| `updated` | Optional ISO date — only when substantively revised |
| `tags` | Required non-empty string array — reuse project tag vocabulary where it overlaps (`AI`, `Full-Stack`, `Design`, …) |
| `readingTimeMinutes` | Optional in source — **computed from body word count** at compile time (remark) and again in `validate:content` |
| `status` | `"published"` \| `"draft"` — drafts never reach public lists/sitemap |

## Body

Standard Markdown/MDX. Initial component whitelist:

- `<Callout variant="note|tip|warn" title="...">...</Callout>`

Do not add more MDX components until a real article needs them.

## Build gates

`npm run validate:content` runs Zod frontmatter validation (via `gray-matter`) and rejects
`status: "published"` articles that still contain `_todo` / `TBD` / related placeholder
markers in frontmatter or body.

Runtime loading: `import.meta.glob` in `src/lib/articles.ts` (compiled MDX + raw source for
reading time).
