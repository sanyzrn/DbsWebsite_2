import type { Lang } from "./i18n";

/** Bilingual string used in content/news/*.json */
export type LocaleText = { fa: string; en: string };

/**
 * Canonical Daily Digest item schema.
 * Runtime shape is enforced by `scripts/news-content.mjs` (Zod) at build time.
 * `sourceUrl` + `sourceName` are required — citation-only; no unattributed items.
 */
export type NewsItemContent = {
  id: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  title: LocaleText;
  summary: LocaleText;
  /** Real external source URL — required */
  sourceUrl: string;
  /** Human-readable source name for the visible attribution link — required */
  sourceName: string;
  curatedByAI: boolean;
  tags: string[];
};

/** Locale-resolved digest item used by the UI. */
export type LocalizedNewsItem = {
  id: string;
  date: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  curatedByAI: boolean;
  tags: string[];
};

const modules = import.meta.glob("../../content/news/*.json", {
  eager: true,
  import: "default",
}) as Record<string, NewsItemContent>;

function requireNewsItem(filePath: string, raw: NewsItemContent): NewsItemContent {
  if (
    !raw?.id ||
    !raw.date ||
    !raw.title?.fa ||
    !raw.title?.en ||
    !raw.summary?.fa ||
    !raw.summary?.en ||
    !raw.sourceUrl ||
    !raw.sourceName ||
    typeof raw.curatedByAI !== "boolean" ||
    !Array.isArray(raw.tags)
  ) {
    throw new Error(
      `News item ${filePath} is missing required fields (id, date, title, summary, sourceUrl, sourceName, curatedByAI, tags). ` +
        `Run \`npm run validate:content\` for details.`
    );
  }
  return raw;
}

/** All digest items on disk, newest first. */
export function loadNewsItems(): NewsItemContent[] {
  return Object.entries(modules)
    .map(([filePath, raw]) => requireNewsItem(filePath, raw))
    .sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      if (byDate !== 0) return byDate;
      return a.id.localeCompare(b.id);
    });
}

export function localizeNewsItem(item: NewsItemContent, lang: Lang): LocalizedNewsItem {
  return {
    id: item.id,
    date: item.date,
    title: item.title[lang] ?? item.title.en,
    summary: item.summary[lang] ?? item.summary.en,
    sourceUrl: item.sourceUrl,
    sourceName: item.sourceName,
    curatedByAI: item.curatedByAI,
    tags: item.tags,
  };
}

/** Public Daily Digest list for the current locale. */
export function getLocalizedNewsItems(lang: Lang): LocalizedNewsItem[] {
  return loadNewsItems().map((item) => localizeNewsItem(item, lang));
}
