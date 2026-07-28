/**
 * Shared article MDX frontmatter schema + maturity gates for build scripts.
 * Keep in sync with `src/lib/articles.ts` TypeScript types.
 *
 * Files live at content/articles/<slug>.<fa|en>.mdx — one locale per file.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { PLACEHOLDER_MARKERS } from "./project-content.mjs";
import { ROOT } from "./site-url.mjs";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected ISO date YYYY-MM-DD");

export const ARTICLE_STATUSES = ["published", "draft"];

/** ~words per minute — used when computing readingTimeMinutes from body text. */
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

const ARTICLE_FILE_RE = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.(fa|en)\.mdx$/;

export function articlesDir(root = ROOT) {
  return path.join(root, "content", "articles");
}

/**
 * Rough word count for reading-time estimates.
 * Strips MDX/JSX-ish tags and punctuation-heavy noise; works for fa + en whitespace.
 */
export function countWords(body) {
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

export function computeReadingTimeMinutes(body, wpm = ARTICLE_WORDS_PER_MINUTE) {
  return Math.max(1, Math.round(countWords(body) / wpm));
}

export function parseArticleFilename(name) {
  const match = ARTICLE_FILE_RE.exec(name);
  if (!match) return null;
  return { slug: match[1], lang: match[2] };
}

export function loadArticlesFromDisk(root = ROOT) {
  const dir = articlesDir(root);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const file = path.join(dir, f);
      const raw = fs.readFileSync(file, "utf8");
      return { file, name: f, raw };
    });
}

export function findArticlePlaceholderHits(frontmatter, body) {
  const blob = [
    frontmatter.title,
    frontmatter.description,
    ...(frontmatter.tags || []),
    body,
  ]
    .filter(Boolean)
    .join("\n");
  const lower = blob.toLowerCase();
  const hits = [];
  for (const marker of PLACEHOLDER_MARKERS) {
    if (lower.includes(marker.toLowerCase())) hits.push(marker);
  }
  return hits;
}

/**
 * Validate every on-disk article MDX. Empty folder is OK (articles are optional).
 * Throws with a multi-line error on failure.
 * @returns {object[]} parsed articles with slug/lang/readingTimeMinutes
 */
export function validateAllArticleContent(root = ROOT) {
  const entries = loadArticlesFromDisk(root);
  const errors = [];
  const articles = [];

  for (const { file, name, raw } of entries) {
    const parsedName = parseArticleFilename(name);
    if (!parsedName) {
      errors.push(
        `${name} has an invalid filename — expected <slug>.<fa|en>.mdx (lowercase kebab-case slug)`
      );
      continue;
    }

    let data;
    let body;
    try {
      const parsed = matter(raw);
      data = parsed.data;
      body = parsed.content;
    } catch (err) {
      errors.push(`${name} failed frontmatter parse: ${err instanceof Error ? err.message : err}`);
      continue;
    }

    const parsed = articleFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      errors.push(`${name} failed schema validation:\n${detail}`);
      continue;
    }

    const frontmatter = parsed.data;
    if (frontmatter.status === "published") {
      const hits = findArticlePlaceholderHits(frontmatter, body);
      if (hits.length) {
        errors.push(
          `${name} has status "published" but still contains placeholder marker(s): ${hits.join(", ")}. ` +
            `Set status to "draft" (or remove the markers) before publishing.`
        );
      }
    }

    articles.push({
      ...frontmatter,
      readingTimeMinutes: computeReadingTimeMinutes(body),
      slug: parsedName.slug,
      lang: parsedName.lang,
      __file: file,
      __name: name,
      __body: body,
    });
  }

  if (errors.length) {
    throw new Error(
      `Article content validation failed (${errors.length} file(s)):\n\n` + errors.join("\n\n")
    );
  }

  return articles;
}

export function getPublishedArticleSlugs(root = ROOT) {
  const published = validateAllArticleContent(root).filter((a) => a.status === "published");
  return [...new Set(published.map((a) => a.slug))].sort();
}
