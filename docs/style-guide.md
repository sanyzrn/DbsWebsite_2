# Persian & bilingual copy style guide

Conventions for `src/lib/i18n.ts` (`fa` dictionary) and related UI copy.
Follow these when adding or editing Persian content.

## Zero-width non-joiner (ZWNJ / نیم‌فاصله)

Use ZWNJ (`‌`, U+200C) in:

- **Ezāfe after ه:** `نقطه‌ی اتصال`, `تجربه‌ی کاربری`, `تجربه‌ی محصول` — never a detached hamza (`ء` / `ٔ`) after ه.
- **Solid compounds:** `نقش‌محور`, `چندمرحله‌ای`, `قابل‌لمس`, `قابل‌فهم`, `بسته‌بندی`, `می‌کنم`.
- **Parallel “قابل …” phrases:** prefer spaced parallel forms when contrasting two qualities: `قابل استفاده و قابل توسعه` (not `قابل‌استفاده و توسعه‌پذیر`).

## Borrowed tech terms in Persian prose

**Persianize common product nouns** in running copy:

- `عامل‌های هوشمند` (not `Agentها`)
- `ربات‌های گفتگو` / `چت‌بات` (not `Chatbotها`)
- Keep product *names* Latin as branded: `DbsChatBot`, `DbsAI`, …

**Keep short Latin acronyms** as-is (optionally with Persian plural `ها`):

- `APIها`, `LLM`, `UI/UX`, `AI`, `PWA`, `JWT`

Do **not** mix `Agentها` style with fully Persian forms in the same sentence.

## Database wording

Use **`دیتابیس`** in product/engineering copy (`طراحی دیتابیس`).  
Reserve **`پایگاه دانش`** for knowledge-base contexts (not as a synonym for database).

## Numerals

- Prose and stats in `fa`: **Persian digits** (`۱۶`, `۲۴`, `۲۰۰۸`).
- Technical IDs, phone numbers, emails, code, and filter chip keys may stay Latin.

## Brand casing

| Form | Use |
|------|-----|
| `DBSGraphic` | Studio / brand lockup |
| `DbsPulse`, `DbsAI`, `DbsKeep`, `DbsBrain`, `DbsChatBot`, `DbsTools` | Product names |
| Avoid | `DBS Pulse`, `dbsAI`, `DBSAI` in user-facing copy |

## Spacing around Latin tokens

- No extra spaces inside acronyms: `UI/UX`, not `UI / UX`.
- One regular space between Persian and Latin: `محصولات هوشمند و AI`, `یکپارچه‌سازی AI`.
- Em dash `—` for parenthetical breaks (same as English UI).

## Hero slogan pattern

Lead-in is fixed: `از یک ایده،` + connector ` تا ` + cycling phrase.  
Do not reintroduce the old standalone `از ایده تا محصول واقعی` wording elsewhere.

## Access-control phrasing

Prefer **`دسترسی نقش‌محور`** over longer calques like `کنترل دسترسی مبتنی بر نقش`.
