import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hreflangPair } from "../../scripts/sitemap-hreflang.mjs";
import { ROOT } from "../../scripts/site-url.mjs";

describe("sitemap hreflangPair", () => {
  it("maps fa/en home and nested routes to reciprocal alternates", () => {
    expect(hreflangPair("/")).toEqual({
      fa: "https://saeedzarrini.ir/",
      en: "https://saeedzarrini.ir/en",
    });
    expect(hreflangPair("/en")).toEqual({
      fa: "https://saeedzarrini.ir/",
      en: "https://saeedzarrini.ir/en",
    });
    expect(hreflangPair("/projects/dbspulse")).toEqual({
      fa: "https://saeedzarrini.ir/projects/dbspulse",
      en: "https://saeedzarrini.ir/en/projects/dbspulse",
    });
    expect(hreflangPair("/en/projects/dbspulse")).toEqual({
      fa: "https://saeedzarrini.ir/projects/dbspulse",
      en: "https://saeedzarrini.ir/en/projects/dbspulse",
    });
  });
});

describe("public/sitemap.xml xhtml hreflang", () => {
  it("declares xmlns:xhtml and emits fa/en alternates on each url", () => {
    const xml = fs.readFileSync(path.join(ROOT, "public", "sitemap.xml"), "utf8");
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toMatch(/<xhtml:link rel="alternate" hreflang="fa" href="https:\/\/saeedzarrini\.ir\/"/);
    expect(xml).toMatch(/<xhtml:link rel="alternate" hreflang="en" href="https:\/\/saeedzarrini\.ir\/en"/);
    // Every <url> block should contain both alternates
    const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
    expect(urlBlocks.length).toBeGreaterThan(4);
    for (const block of urlBlocks) {
      expect(block).toContain('hreflang="fa"');
      expect(block).toContain('hreflang="en"');
    }
  });
});
