import { describe, expect, it } from "vitest";
import { articleMdxComponents } from "../components/mdx/components";
import {
  findArticle,
  getPublishedArticleSlugs,
  getPublishedArticles,
  isPublishedArticle,
  loadArticles,
} from "../lib/articles";

describe("articles loader", () => {
  it("loads locale-specific MDX modules with frontmatter and a component", () => {
    const all = loadArticles();
    expect(all.length).toBeGreaterThanOrEqual(2);

    const en = findArticle("en", "ai-layer-without-boiling-the-ocean");
    const fa = findArticle("fa", "ai-layer-without-boiling-the-ocean");
    expect(en).toBeTruthy();
    expect(fa).toBeTruthy();
    expect(en?.frontmatter.title).toMatch(/AI/i);
    expect(fa?.frontmatter.title).toBeTruthy();
    expect(en?.frontmatter.readingTimeMinutes).toBeGreaterThanOrEqual(1);
    expect(typeof en?.Component).toBe("function");
    expect(articleMdxComponents.Callout).toBeTruthy();
  });

  it("keeps draft articles off public lists and published slug index", () => {
    const draft = findArticle("en", "test-short-note");
    expect(draft).toBeTruthy();
    expect(isPublishedArticle(draft!)).toBe(false);
    expect(getPublishedArticles("en").map((a) => a.slug)).not.toContain("test-short-note");
    expect(getPublishedArticleSlugs()).not.toContain("test-short-note");

    const published = findArticle("en", "ai-layer-without-boiling-the-ocean");
    expect(published).toBeTruthy();
    expect(isPublishedArticle(published!)).toBe(true);
    expect(getPublishedArticles("en").map((a) => a.slug)).toContain(
      "ai-layer-without-boiling-the-ocean"
    );
    expect(getPublishedArticleSlugs()).toContain("ai-layer-without-boiling-the-ocean");
  });
});
