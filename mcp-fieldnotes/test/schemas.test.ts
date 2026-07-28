import { describe, expect, it } from "vitest";
import { extractBearerToken, authorizeBearer } from "../src/auth";
import {
  articleFrontmatterSchema,
  computeReadingTimeMinutes,
  countWords,
  newsItemSchema,
  parseArticleFilename,
} from "../src/schemas";
import { parseArticleMdx, resolveArticleFrontmatter, serializeArticleMdx } from "../src/mdx";

describe("auth", () => {
  it("extracts Bearer tokens", () => {
    expect(extractBearerToken("Bearer secret-token")).toBe("secret-token");
    expect(extractBearerToken("bearer secret-token")).toBe("secret-token");
    expect(extractBearerToken("Basic x")).toBeNull();
    expect(extractBearerToken(null)).toBeNull();
  });

  it("rejects missing or wrong tokens with 401", () => {
    const req = new Request("https://example.com/mcp", {
      headers: { Authorization: "Bearer wrong" },
    });
    const res = authorizeBearer(req, "expected-secret");
    expect(res?.status).toBe(401);
  });

  it("allows matching tokens", () => {
    const req = new Request("https://example.com/mcp", {
      headers: { Authorization: "Bearer expected-secret" },
    });
    expect(authorizeBearer(req, "expected-secret")).toBeNull();
  });
});

describe("article schema parity", () => {
  it("accepts valid frontmatter", () => {
    const parsed = articleFrontmatterSchema.safeParse({
      title: "Hello",
      description: "Desc",
      date: "2026-07-19",
      tags: ["AI"],
      status: "draft",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects empty tags", () => {
    const parsed = articleFrontmatterSchema.safeParse({
      title: "Hello",
      description: "Desc",
      date: "2026-07-19",
      tags: [],
      status: "draft",
    });
    expect(parsed.success).toBe(false);
  });

  it("computes reading time like scripts/article-content.mjs", () => {
    const words = Array.from({ length: 400 }, () => "word").join(" ");
    expect(computeReadingTimeMinutes(words)).toBe(2);
    expect(computeReadingTimeMinutes("short")).toBe(1);
    expect(countWords("one two three")).toBe(3);
  });

  it("parses article filenames", () => {
    expect(parseArticleFilename("foo.en.mdx")).toEqual({ slug: "foo", lang: "en" });
    expect(parseArticleFilename("Bad.en.mdx")).toBeNull();
  });

  it("round-trips MDX frontmatter", () => {
    const fm = {
      title: "Title",
      description: "Desc",
      date: "2026-07-19",
      tags: ["AI", "Design"],
      status: "draft" as const,
      readingTimeMinutes: 2,
    };
    const raw = serializeArticleMdx(fm, "Hello **world**.\n");
    const parsed = parseArticleMdx(raw);
    expect(parsed.frontmatter.title).toBe("Title");
    expect(parsed.frontmatter.tags).toEqual(["AI", "Design"]);
    expect(parsed.body.trim()).toBe("Hello **world**.");
  });

  it("merges partial frontmatter and fills reading time", () => {
    const existing = {
      title: "Old",
      description: "Old desc",
      date: "2026-01-01",
      tags: ["AI"],
      status: "draft" as const,
      readingTimeMinutes: 1,
    };
    const next = resolveArticleFrontmatter(
      { title: "New", status: "published" },
      Array.from({ length: 250 }, () => "word").join(" "),
      existing
    );
    expect(next.title).toBe("New");
    expect(next.description).toBe("Old desc");
    expect(next.status).toBe("published");
    expect(next.readingTimeMinutes).toBe(1);
  });
});

describe("news schema citation gate", () => {
  const base = {
    id: "2026-07-19-example",
    date: "2026-07-19",
    title: { fa: "نمونه", en: "Example" },
    summary: { fa: "خلاصه", en: "Summary" },
    sourceUrl: "https://example.com/a",
    sourceName: "Example Source",
    curatedByAI: true,
    tags: ["AI"],
  };

  it("requires a real sourceUrl", () => {
    expect(newsItemSchema.safeParse(base).success).toBe(true);
    expect(newsItemSchema.safeParse({ ...base, sourceUrl: "not-a-url" }).success).toBe(false);
    const { sourceUrl: _, ...rest } = base;
    expect(newsItemSchema.safeParse(rest).success).toBe(false);
  });

  it("requires sourceName", () => {
    const { sourceName: _, ...rest } = base;
    expect(newsItemSchema.safeParse(rest).success).toBe(false);
  });
});
