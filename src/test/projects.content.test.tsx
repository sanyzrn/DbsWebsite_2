import { describe, expect, it } from "vitest";
import { getLocalizedProjects, loadProjectContent } from "../lib/projects";
import { getDictionary } from "../lib/i18n";

describe("projects content pipeline", () => {
  it("loads all project JSON files sorted by order", () => {
    const all = loadProjectContent();
    expect(all.length).toBeGreaterThanOrEqual(10);
    expect(all[0].slug).toBe("dbspulse");
    expect(all[0].featured).toBe(true);
    for (let i = 1; i < all.length; i++) {
      expect(all[i].order).toBeGreaterThanOrEqual(all[i - 1].order);
    }
  });

  it("localizes bilingual fields for fa and en", () => {
    const fa = getLocalizedProjects("fa");
    const en = getLocalizedProjects("en");
    const pulseFa = fa.find((p) => p.slug === "dbspulse");
    const pulseEn = en.find((p) => p.slug === "dbspulse");
    expect(pulseFa?.subtitle).toContain("ارزیابی");
    expect(pulseEn?.subtitle).toContain("performance");
    expect(pulseFa?.role.length).toBeGreaterThan(0);
    expect(pulseEn?.tech).toContain("React");
    expect(pulseFa?.problem).toContain("اکسل");
    expect(pulseEn?.approach).toContain("FastAPI");
    expect(pulseEn?.result).toContain("Claude Code");
  });

  it("fills case-study fields for production projects and flags provisional copy", () => {
    const all = loadProjectContent();
    const filled = ["dbspulse", "dbskeep", "dbsbrain", "dbschatbot", "dbsai", "dbstools", "hesabyar"];
    for (const slug of filled) {
      const p = all.find((x) => x.slug === slug);
      expect(p, slug).toBeTruthy();
      expect(p!.problem.fa.trim().length).toBeGreaterThan(0);
      expect(p!.problem.en.trim().length).toBeGreaterThan(0);
      expect(p!.approach.fa.trim().length).toBeGreaterThan(0);
      expect(p!.approach.en.trim().length).toBeGreaterThan(0);
      expect(p!.result.fa.trim().length).toBeGreaterThan(0);
      expect(p!.result.en.trim().length).toBeGreaterThan(0);
    }
    for (const slug of ["dbsai", "dbstools", "hesabyar"]) {
      const p = all.find((x) => x.slug === slug);
      expect(p?._todo).toMatch(/confirm|replace/i);
    }
    expect(all.find((x) => x.slug === "dbspulse")?._todo).toBeUndefined();
  });

  it("injects localized items into the UI dictionary", () => {
    const dict = getDictionary("en");
    expect(dict.projects.items.some((p) => p.slug === "hesabyar")).toBe(true);
    expect(dict.projects.items.find((p) => p.slug === "hesabyar")?.name).toBe("Hesabyar");
    expect(getDictionary("fa").projects.items.find((p) => p.slug === "hesabyar")?.name).toBe("حسابیار");
  });
});
