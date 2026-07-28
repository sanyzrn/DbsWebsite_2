import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { validateAllTestimonialContent } from "../../scripts/testimonial-content.mjs";

const tmpDirs = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function writeTempTestimonials(files, { withProjects = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "testimonial-content-"));
  tmpDirs.push(root);
  const dir = path.join(root, "content", "testimonials");
  fs.mkdirSync(dir, { recursive: true });
  if (withProjects) {
    const projectsDir = path.join(root, "content", "projects");
    fs.mkdirSync(projectsDir, { recursive: true });
    fs.writeFileSync(
      path.join(projectsDir, "dbspulse.json"),
      JSON.stringify({ slug: "dbspulse", id: "dbspulse" })
    );
  }
  for (const [name, body] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), typeof body === "string" ? body : JSON.stringify(body, null, 2));
  }
  return root;
}

const goodDirect = {
  id: "pharma-perf-review",
  quoteType: "direct",
  quote: { fa: "نقل‌قول واقعی", en: "A real quote" },
  attribution: { fa: "مدیر محصول، صنعت داروسازی", en: "Product manager, pharmaceutical industry" },
  relatedProjectSlug: "dbspulse",
  status: "published",
};

const goodOutcome = {
  id: "ops-cycle-cut",
  quoteType: "outcome-statement",
  quote: {
    fa: "چرخهٔ ارزیابی از چند هفته به چند روز کاهش یافت.",
    en: "Review cycles dropped from weeks to days.",
  },
  attribution: { fa: "نتیجهٔ پروژهٔ سازمانی", en: "Enterprise engagement outcome" },
  status: "draft",
};

describe("testimonial content gates", () => {
  it("allows an empty testimonials folder", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "testimonials-empty-"));
    tmpDirs.push(root);
    fs.mkdirSync(path.join(root, "content", "testimonials"), { recursive: true });
    expect(validateAllTestimonialContent(root)).toEqual([]);
  });

  it("accepts direct and outcome-statement entries", () => {
    const root = writeTempTestimonials({
      "pharma-perf-review.json": goodDirect,
      "ops-cycle-cut.json": goodOutcome,
    });
    const items = validateAllTestimonialContent(root);
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.quoteType).sort()).toEqual(["direct", "outcome-statement"]);
  });

  it("fails when direct quote text is empty in a locale", () => {
    const root = writeTempTestimonials({
      "pharma-perf-review.json": {
        ...goodDirect,
        quote: { fa: "نقل‌قول", en: "   " },
      },
    });
    expect(() => validateAllTestimonialContent(root)).toThrow(/schema validation|quote/i);
  });

  it("rejects unknown relatedProjectSlug", () => {
    const root = writeTempTestimonials({
      "pharma-perf-review.json": { ...goodDirect, relatedProjectSlug: "does-not-exist" },
    });
    expect(() => validateAllTestimonialContent(root)).toThrow(/relatedProjectSlug/i);
  });

  it("rejects id/filename mismatch", () => {
    const root = writeTempTestimonials({
      "other-id.json": goodDirect,
    });
    expect(() => validateAllTestimonialContent(root)).toThrow(/must match filename/i);
  });

  it("rejects invalid filenames", () => {
    const root = writeTempTestimonials({
      "Not_Valid.json": { ...goodDirect, id: "Not_Valid" },
    });
    expect(() => validateAllTestimonialContent(root)).toThrow(/invalid filename/i);
  });
});
