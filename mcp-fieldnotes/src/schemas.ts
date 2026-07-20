/**
 * Workers-compatible Zod schemas — keep in lockstep with:
 *   scripts/article-content.mjs → articleFrontmatterSchema
 *   scripts/news-content.mjs    → newsItemSchema
 *
 * Intentionally omits node:fs / disk loaders; GitHub Contents API supplies file bytes.
 */
import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected ISO date YYYY-MM-DD");

/** Same as scripts/article-content.mjs */
export const ARTICLE_WORDS_PER_MINUTE = 200;

export const articleFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: isoDate,
  updated: isoDate.optional(),
  tags: z.array(z.string().min(1)).min(1),
  /** Optional in source — computed from body word count when omitted. */
  readingTimeMinutes: z.number().positive().finite().optional(),
  status: z.enum(["published", "draft"]),
});

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

const localeText = z.object({
  fa: z.string().min(1),
  en: z.string().min(1),
});

/** Same as scripts/news-content.mjs — sourceUrl + sourceName required (citation-only). */
export const newsItemSchema = z.object({
  id: z.string().min(1),
  date: isoDate,
  title: localeText,
  summary: localeText,
  sourceUrl: z.string().url(),
  sourceName: z.string().trim().min(1),
  curatedByAI: z.boolean(),
  tags: z.array(z.string().min(1)),
});

export type NewsItem = z.infer<typeof newsItemSchema>;

/** Input for create/update news — curatedByAI is forced true by the tool, not caller-controlled. */
export const newsItemWriteSchema = newsItemSchema.omit({ curatedByAI: true });

export const ARTICLE_FILE_RE = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.(fa|en)\.mdx$/;
export const NEWS_FILE_RE = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.json$/;
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseArticleFilename(name: string): { slug: string; lang: "fa" | "en" } | null {
  const match = ARTICLE_FILE_RE.exec(name);
  if (!match) return null;
  return { slug: match[1], lang: match[2] as "fa" | "en" };
}

export function articlePath(slug: string, lang: "fa" | "en"): string {
  return `content/articles/${slug}.${lang}.mdx`;
}

export function newsPath(id: string): string {
  return `content/news/${id}.json`;
}

/**
 * Rough word count for reading-time estimates — identical to scripts/article-content.mjs.
 */
export function countWords(body: string): number {
  const plain = String(body)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/[#>*_\-[\]()!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return 0;
  return plain.split(" ").filter(Boolean).length;
}

export function computeReadingTimeMinutes(body: string, wpm = ARTICLE_WORDS_PER_MINUTE): number {
  return Math.max(1, Math.round(countWords(body) / wpm));
}

export function formatZodError(err: z.ZodError): string {
  return err.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
}
