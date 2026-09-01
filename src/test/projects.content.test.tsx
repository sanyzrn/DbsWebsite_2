import { describe, expect, it } from "vitest";
import { getLocalizedProjects, loadProjectContent } from "../lib/projects";
import { getDictionary } from "../lib/i18n";

describe("projects content pipeline", () => {
  it("loads all project JSON files sorted by order", () => {
    const all = loadProjectContent();
    expect(all).toHaveLength(7);
    for (let i = 1; i < all.length; i++) {
      expect(all[i].order).toBeGreaterThanOrEqual(all[i - 1].order);
    }

    const published = all.filter((project) => project.maturity === "published");
    expect(published[0]?.slug).toBe("nexahr");
    expect(published[1]?.slug).toBe("dbsnex");
    expect(published[0]?.featured).toBe(true);
  });

  it("localizes bilingual fields for fa and en (published listings)", () => {
    const fa = getLocalizedProjects("fa");
    const en = getLocalizedProjects("en");
    const nexahrFa = fa.find((p) => p.slug === "nexahr");
    const nexahrEn = en.find((p) => p.slug === "nexahr");
    expect(nexahrFa?.subtitle).toContain("ارزیابی");
    expect(nexahrEn?.subtitle).toContain("performance");
    expect(nexahrFa?.role.length).toBeGreaterThan(0);
    expect(nexahrEn?.tech).toContain("React");
    expect(nexahrFa?.problem).toContain("اکسل");
    expect(nexahrEn?.approach).toContain("RTL");
    expect(nexahrEn?.result).toContain("HR");
    expect(fa.map((project) => project.slug)).toEqual([
      "nexahr",
      "dbsnex",
      "patient2",
      "nexachat",
      "nexaflow",
      "dbsai",
      "dbstools",
    ]);
  });

  it("fills published case studies and keeps incomplete projects clearly labeled", () => {
    const all = loadProjectContent();
    const published = all.filter((project) => project.maturity === "published");
    for (const p of published) {
      expect(p.status).toBe("production");
      expect(p.problem.fa.trim().length).toBeGreaterThan(0);
      expect(p.problem.en.trim().length).toBeGreaterThan(0);
      expect(p.approach.fa.trim().length).toBeGreaterThan(0);
      expect(p.approach.en.trim().length).toBeGreaterThan(0);
      expect(p.result.fa.trim().length).toBeGreaterThan(0);
      expect(p.result.en.trim().length).toBeGreaterThan(0);
      expect(p._todo).toBeUndefined();
    }

    for (const slug of ["nexaflow", "dbsai", "dbstools"]) {
      const p = all.find((project) => project.slug === slug);
      expect(p?.maturity).toBe("published");
      expect(p?.subtitle.fa).toContain("در حال اجرا");
      expect(p?.subtitle.en).toContain("In progress");
    }
  });

  it("injects only published projects into the UI dictionary listings", () => {
    const dict = getDictionary("en");
    expect(dict.projects.items.some((p) => p.slug === "dbsnex")).toBe(true);
    expect(dict.projects.items.some((p) => p.slug === "nexahr")).toBe(true);
    expect(dict.projects.items.some((p) => p.slug === "nexaflow")).toBe(true);
    expect(dict.projects.items.some((p) => p.slug === "dbsai")).toBe(true);
    expect(dict.projects.items.some((p) => p.slug === "dbstools")).toBe(true);
    expect(dict.projects.items.some((p) => p.slug === "dbspulse")).toBe(false);
    expect(dict.projects.items.some((p) => p.slug === "hesabyar")).toBe(false);
    expect(dict.projects.items.some((p) => p.slug === "concept-01")).toBe(false);
  });

  it("keeps every remaining project publicly published", () => {
    const all = loadProjectContent();
    expect(all).toHaveLength(7);
    expect(all.every((project) => project.maturity === "published")).toBe(true);
  });
});
