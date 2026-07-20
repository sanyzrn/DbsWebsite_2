import type { ComponentType } from "react";
import type { ArticleMdxComponents } from "../components/mdx/components";
import type { Lang } from "./i18n";

/** Publication readiness for articles — mirrors project maturity gating (public = published only). */
export type ArticleStatus = "published" | "draft";

/**
 * Frontmatter authored in content/articles/<slug>.<fa|en>.mdx.
 * Runtime shape is enforced by `scripts/article-content.mjs` (Zod) at build time.
 * `readingTimeMinutes` is computed from body word count via remark (hand-set values are overwritten).
 */
export type ArticleFrontmatter = {
  title: string;
  description: string;
  /** ISO publication date YYYY-MM-DD */
  date: string;
  /** Optional ISO date when substantively revised */
  updated?: string;
  tags: string[];
  status: ArticleStatus;
};

export type Article = {
  slug: string;
  lang: Lang;
  frontmatter: ArticleFrontmatter & { readingTimeMinutes: number };
  Component: ComponentType<{ components?: ArticleMdxComponents }>;
};

type MdxModule = {
  default: ComponentType<{ components?: ArticleMdxComponents }>;
  frontmatter?: Partial<ArticleFrontmatter> & { readingTimeMinutes?: number };
};

const ARTICLE_PATH_RE = /\/([^/]+)\.(fa|en)\.mdx$/;

const compiledModules = import.meta.glob("../../content/articles/*.mdx", {
  eager: true,
}) as Record<string, MdxModule>;

function parseArticlePath(filePath: string): { slug: string; lang: Lang } | null {
  const match = ARTICLE_PATH_RE.exec(filePath);
  if (!match) return null;
  return { slug: match[1], lang: match[2] as Lang };
}

function requireFrontmatter(
  filePath: string,
  mod: MdxModule
): ArticleFrontmatter & { readingTimeMinutes: number } {
  const fm = mod.frontmatter;
  if (!fm?.title || !fm.description || !fm.date || !fm.status || !Array.isArray(fm.tags) || fm.tags.length === 0) {
    throw new Error(
      `Article ${filePath} is missing required frontmatter (title, description, date, tags, status). ` +
        `Run \`npm run validate:content\` for details.`
    );
  }
  return {
    title: fm.title,
    description: fm.description,
    date: fm.date,
    updated: fm.updated,
    tags: fm.tags,
    status: fm.status,
    readingTimeMinutes: Math.max(1, Math.round(Number(fm.readingTimeMinutes) || 1)),
  };
}

export function isPublishedArticle(article: Pick<Article, "frontmatter">): boolean {
  return article.frontmatter.status === "published";
}

/** All locale-specific article modules on disk (draft + published). */
export function loadArticles(): Article[] {
  return Object.entries(compiledModules)
    .map(([filePath, mod]) => {
      const parsed = parseArticlePath(filePath);
      if (!parsed || !mod?.default) return null;
      const frontmatter = requireFrontmatter(filePath, mod);
      return {
        slug: parsed.slug,
        lang: parsed.lang,
        frontmatter,
        Component: mod.default,
      } satisfies Article;
    })
    .filter((a): a is Article => a != null)
    .sort((a, b) => {
      const byDate = b.frontmatter.date.localeCompare(a.frontmatter.date);
      if (byDate !== 0) return byDate;
      return a.slug.localeCompare(b.slug);
    });
}

/** Public listings — draft articles never appear here. */
export function getPublishedArticles(lang: Lang): Article[] {
  return loadArticles().filter((a) => a.lang === lang && isPublishedArticle(a));
}

/** Direct URL lookup — includes drafts for internal review / future noindex routes. */
export function findArticle(lang: Lang, slug: string): Article | undefined {
  return loadArticles().find((a) => a.lang === lang && a.slug === slug);
}

/** Unique published slugs across locales (for sitemap later). */
export function getPublishedArticleSlugs(): string[] {
  return [
    ...new Set(loadArticles().filter(isPublishedArticle).map((a) => a.slug)),
  ].sort();
}
