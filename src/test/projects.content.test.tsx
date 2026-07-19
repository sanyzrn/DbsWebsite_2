import { describe, expect, it } from "vitest";
import { getLocalizedProjects, loadProjectContent } from "../lib/projects";
import { getDictionary } from "../lib/i18n";
import { resolvePageSeo } from "../lib/seo";

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

  it("localizes bilingual fields for fa and en (published listings)", () => {
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
    // Draft projects stay off public listings
    expect(fa.some((p) => p.slug === "hesabyar")).toBe(false);
    expect(fa.some((p) => p.slug.startsWith("concept-"))).toBe(false);
  });

  it("fills case-study fields for published production projects and keeps drafts marked", () => {
    const all = loadProjectContent();
    const published = ["dbspulse", "dbskeep", "dbsbrain", "dbschatbot"];
    for (const slug of published) {
      const p = all.find((x) => x.slug === slug);
      expect(p, slug).toBeTruthy();
      expect(p!.maturity).toBe("published");
      expect(p!.problem.fa.trim().length).toBeGreaterThan(0);
      expect(p!.problem.en.trim().length).toBeGreaterThan(0);
      expect(p!.approach.fa.trim().length).toBeGreaterThan(0);
      expect(p!.approach.en.trim().length).toBeGreaterThan(0);
      expect(p!.result.fa.trim().length).toBeGreaterThan(0);
      expect(p!.result.en.trim().length).toBeGreaterThan(0);
      expect(p!._todo).toBeUndefined();
    }
    for (const slug of ["dbsai", "dbstools", "hesabyar"]) {
      const p = all.find((x) => x.slug === slug);
      expect(p?.maturity).toBe("draft");
      expect(p?._todo).toMatch(/confirm|replace/i);
    }
    for (const slug of ["concept-01", "concept-02", "concept-03"]) {
      expect(all.find((x) => x.slug === slug)?.maturity).toBe("draft");
    }
  });

  it("injects only published projects into the UI dictionary listings", () => {
    const dict = getDictionary("en");
    expect(dict.projects.items.some((p) => p.slug === "dbspulse")).toBe(true);
    expect(dict.projects.items.some((p) => p.slug === "hesabyar")).toBe(false);
    expect(dict.projects.items.some((p) => p.slug === "concept-01")).toBe(false);
  });

  it("marks draft project pages with robots noindex", () => {
    const draft = loadProjectContent().find((p) => p.slug === "dbsai");
    expect(draft?.maturity).toBe("draft");
    const seo = resolvePageSeo("en", "project", {
      project: {
        id: draft!.id,
        slug: draft!.slug,
        name: draft!.name.en,
        subtitle: draft!.subtitle.en,
        desc: draft!.desc.en,
        problem: draft!.problem.en,
        approach: draft!.approach.en,
        result: draft!.result.en,
        role: draft!.role.en,
        tech: draft!.tech,
        tags: draft!.tags,
        status: draft!.status,
        maturity: draft!.maturity,
        featured: draft!.featured,
        order: draft!.order,
        image_url: draft!.image_url,
      },
    });
    expect(seo.robots).toBe("noindex, follow");
  });
});
