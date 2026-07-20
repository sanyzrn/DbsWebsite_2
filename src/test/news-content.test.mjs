import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { validateAllNewsContent } from "../../scripts/news-content.mjs";

const tmpDirs = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function writeTempNews(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "news-content-"));
  tmpDirs.push(root);
  const dir = path.join(root, "content", "news");
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, body] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), typeof body === "string" ? body : JSON.stringify(body, null, 2));
  }
  return root;
}

const goodItem = {
  id: "2026-07-19-example",
  date: "2026-07-19",
  title: { fa: "نمونه", en: "Example" },
  summary: { fa: "خلاصه", en: "Summary" },
  sourceUrl: "https://example.com/article",
  sourceName: "Example Source",
  curatedByAI: true,
  tags: ["AI"],
};

describe("news content citation gates", () => {
  it("allows an empty news folder", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "news-empty-"));
    tmpDirs.push(root);
    fs.mkdirSync(path.join(root, "content", "news"), { recursive: true });
    expect(validateAllNewsContent(root)).toEqual([]);
  });

  it("accepts a well-formed attributed news item", () => {
    const root = writeTempNews({ "2026-07-19-example.json": goodItem });
    const items = validateAllNewsContent(root);
    expect(items).toHaveLength(1);
    expect(items[0].sourceUrl).toBe("https://example.com/article");
    expect(items[0].sourceName).toBe("Example Source");
  });

  it("fails when sourceUrl is missing", () => {
    const { sourceUrl: _omit, ...rest } = goodItem;
    const root = writeTempNews({ "2026-07-19-example.json": rest });
    expect(() => validateAllNewsContent(root)).toThrow(/sourceUrl/i);
  });

  it("fails when sourceName is missing", () => {
    const { sourceName: _omit, ...rest } = goodItem;
    const root = writeTempNews({ "2026-07-19-example.json": rest });
    expect(() => validateAllNewsContent(root)).toThrow(/sourceName/i);
  });

  it("fails when sourceUrl is not a URL", () => {
    const root = writeTempNews({
      "2026-07-19-example.json": { ...goodItem, sourceUrl: "not-a-url" },
    });
    expect(() => validateAllNewsContent(root)).toThrow(/sourceUrl|url/i);
  });

  it("rejects id/filename mismatch", () => {
    const root = writeTempNews({
      "other-id.json": goodItem,
    });
    expect(() => validateAllNewsContent(root)).toThrow(/must match filename/i);
  });

  it("rejects invalid filenames", () => {
    const root = writeTempNews({
      "Not_Valid.json": { ...goodItem, id: "Not_Valid" },
    });
    expect(() => validateAllNewsContent(root)).toThrow(/invalid filename/i);
  });
});
