import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  computeReadingTimeMinutes,
  findArticlePlaceholderHits,
  getPublishedArticleSlugs,
  validateAllArticleContent,
} from "../../scripts/article-content.mjs";

const tmpDirs = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function writeTempArticles(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "article-content-"));
  tmpDirs.push(root);
  const dir = path.join(root, "content", "articles");
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, body] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), body);
  }
  return root;
}

const goodFrontmatter = `---
title: "Sample article"
description: "A short description for cards and meta."
date: "2026-07-19"
tags: ["AI", "Full-Stack"]
status: "published"
---

# Hello

Body copy with enough words to exercise reading time without placeholders.
`;

describe("article content maturity gates", () => {
  it("allows an empty articles folder", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "article-empty-"));
    tmpDirs.push(root);
    fs.mkdirSync(path.join(root, "content", "articles"), { recursive: true });
    expect(validateAllArticleContent(root)).toEqual([]);
  });

  it("fails validation when a published article contains a _todo marker", () => {
    const root = writeTempArticles({
      "bad.en.mdx": `---
title: "Bad"
description: "Desc"
date: "2026-07-19"
tags: ["AI"]
status: "published"
---

Still has _todo in the body.
`,
    });

    expect(() => validateAllArticleContent(root)).toThrow(/published/i);
    expect(() => validateAllArticleContent(root)).toThrow(/_todo/i);
  });

  it("allows draft articles to keep placeholder markers", () => {
    const root = writeTempArticles({
      "draft.en.mdx": `---
title: "Draft"
description: "details soon"
date: "2026-07-19"
tags: ["Design"]
status: "draft"
---

TBD — more copy later.
`,
    });

    const articles = validateAllArticleContent(root);
    expect(articles).toHaveLength(1);
    expect(articles[0].status).toBe("draft");
    expect(findArticlePlaceholderHits(articles[0], articles[0].__body).length).toBeGreaterThan(0);
  });

  it("rejects missing required frontmatter fields", () => {
    const root = writeTempArticles({
      "incomplete.en.mdx": `---
title: "No tags"
description: "Desc"
date: "2026-07-19"
status: "draft"
---

Body.
`,
    });

    expect(() => validateAllArticleContent(root)).toThrow(/schema validation/i);
  });

  it("rejects invalid filenames", () => {
    const root = writeTempArticles({
      "Not-Valid.en.mdx": goodFrontmatter.replace('status: "published"', 'status: "draft"'),
    });

    expect(() => validateAllArticleContent(root)).toThrow(/invalid filename/i);
  });

  it("excludes draft articles from published slugs", () => {
    const root = writeTempArticles({
      "live.en.mdx": goodFrontmatter,
      "wip.en.mdx": goodFrontmatter
        .replace('title: "Sample article"', 'title: "WIP"')
        .replace('status: "published"', 'status: "draft"'),
    });

    expect(getPublishedArticleSlugs(root)).toEqual(["live"]);
  });

  it("computes reading time from word count", () => {
    const words = Array.from({ length: 400 }, () => "word").join(" ");
    expect(computeReadingTimeMinutes(words)).toBe(2);
    expect(computeReadingTimeMinutes("short")).toBe(1);
  });
});
