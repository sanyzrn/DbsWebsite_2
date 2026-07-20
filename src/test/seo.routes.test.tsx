import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { dictionaries } from "../lib/i18n";
import { listPrerenderPaths, resolvePageSeo, resolveSeoForPath } from "../lib/seo";
import { loadProjectContent } from "../lib/projects";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.documentElement.lang = "fa";
  document.documentElement.dir = "rtl";
  window.history.replaceState(null, "", "/");
  document.head.querySelectorAll('link[rel="alternate"], link[rel="canonical"]').forEach((el) => el.remove());
});

async function expectDocMeta(opts: {
  title: string;
  description: string;
  canonicalPath: string;
  hreflangFa: string;
  hreflangEn: string;
}) {
  await waitFor(() => {
    expect(document.title).toBe(opts.title);
  });
  const desc = document.querySelector('meta[name="description"]');
  expect(desc?.getAttribute("content")).toBe(opts.description);

  const canonical = document.querySelector('link[rel="canonical"]');
  expect(canonical?.getAttribute("href")).toMatch(new RegExp(`${opts.canonicalPath.replace(/\/$/, "")}/?$`));

  const fa = document.querySelector('link[rel="alternate"][hreflang="fa"]');
  const en = document.querySelector('link[rel="alternate"][hreflang="en"]');
  expect(fa?.getAttribute("href")).toMatch(new RegExp(`${opts.hreflangFa.replace(/\/$/, "")}/?$`));
  expect(en?.getAttribute("href")).toMatch(new RegExp(`${opts.hreflangEn.replace(/\/$/, "")}/?$`));
}

describe("route SEO meta (both locales)", () => {
  it("keeps locale SEO titles/descriptions within budgets and has no keywords meta", () => {
    for (const lang of ["fa", "en"] as const) {
      const seo = dictionaries[lang].seo;
      expect(seo.title.length).toBeLessThanOrEqual(60);
      expect(seo.description.length).toBeLessThanOrEqual(155);
      expect(seo.title.startsWith("Saeed Zarrini |")).toBe(true);
      for (const page of [seo.projects, seo.articles, seo.news, seo.about, seo.contact, seo.privacy, seo.terms, seo.notFound]) {
        expect(page.title.length).toBeLessThanOrEqual(60);
        expect(page.description.length).toBeLessThanOrEqual(155);
      }
    }
    expect(document.querySelector('meta[name="keywords"]')).toBeNull();
  });

  it("home fa/en expose title, description, canonical, hreflang", async () => {
    render(<App />);
    await expectDocMeta({
      title: dictionaries.fa.seo.title,
      description: dictionaries.fa.seo.description,
      canonicalPath: "/",
      hreflangFa: "/",
      hreflangEn: "/en",
    });

    cleanup();
    window.history.pushState(null, "", "/en");
    render(<App />);
    await expectDocMeta({
      title: dictionaries.en.seo.title,
      description: dictionaries.en.seo.description,
      canonicalPath: "/en",
      hreflangFa: "/",
      hreflangEn: "/en",
    });
  });

  it("privacy and terms routes expose locale SEO in both languages", async () => {
    window.history.pushState(null, "", "/privacy");
    render(<App />);
    await expectDocMeta({
      title: dictionaries.fa.seo.privacy.title,
      description: dictionaries.fa.seo.privacy.description,
      canonicalPath: "/privacy",
      hreflangFa: "/privacy",
      hreflangEn: "/en/privacy",
    });

    cleanup();
    window.history.pushState(null, "", "/en/terms");
    render(<App />);
    await expectDocMeta({
      title: dictionaries.en.seo.terms.title,
      description: dictionaries.en.seo.terms.description,
      canonicalPath: "/en/terms",
      hreflangFa: "/terms",
      hreflangEn: "/en/terms",
    });
  });

  it("project detail routes expose case-study title and reciprocal hreflang", async () => {
    const slug = loadProjectContent()[0]?.slug ?? "dbspulse";
    window.history.pushState(null, "", `/projects/${slug}`);
    render(<App />);
    const faSeo = resolveSeoForPath(`/projects/${slug}`);
    await expectDocMeta({
      title: faSeo.title,
      description: faSeo.description,
      canonicalPath: `/projects/${slug}`,
      hreflangFa: `/projects/${slug}`,
      hreflangEn: `/en/projects/${slug}`,
    });

    cleanup();
    window.history.pushState(null, "", `/en/projects/${slug}`);
    render(<App />);
    const enSeo = resolveSeoForPath(`/en/projects/${slug}`);
    await expectDocMeta({
      title: enSeo.title,
      description: enSeo.description,
      canonicalPath: `/en/projects/${slug}`,
      hreflangFa: `/projects/${slug}`,
      hreflangEn: `/en/projects/${slug}`,
    });
  });

  it("listPrerenderPaths covers both locales for static + project + article routes", () => {
    const paths = listPrerenderPaths();
    for (const p of ["/", "/en", "/privacy", "/en/privacy", "/terms", "/en/terms", "/articles", "/en/articles", "/news", "/en/news"]) {
      expect(paths).toContain(p);
    }
    const slug = loadProjectContent()[0]?.slug;
    if (slug) {
      expect(paths).toContain(`/projects/${slug}`);
      expect(paths).toContain(`/en/projects/${slug}`);
    }
    expect(paths).toContain("/articles/ai-layer-without-boiling-the-ocean");
    expect(paths).toContain("/en/articles/ai-layer-without-boiling-the-ocean");
  });

  it("resolveSeoForPath emits JSON-LD WebSite/Organization on home and explicit schemaType on projects", () => {
    const home = resolveSeoForPath("/");
    const blob = JSON.stringify(home.jsonLd);
    expect(blob).toContain("Person");
    expect(blob).toContain("Organization");
    expect(blob).toContain("ProfessionalService");
    expect(blob).toContain("WebSite");

    const projects = loadProjectContent();
    const pulse = projects.find((p) => p.slug === "dbspulse") ?? projects[0];
    const project = resolveSeoForPath(`/projects/${pulse.slug}`);
    const pblob = JSON.stringify(project.jsonLd);
    expect(pblob).toContain(`"@type":"${pulse.schemaType}"`);
    // No automatic zero-price Offer unless isPubliclyAvailable is true
    expect(pulse.isPubliclyAvailable).toBe(false);
    expect(pblob).not.toContain('"@type":"Offer"');
    expect(pblob).not.toMatch(/"price"\s*:\s*"0"/);

    const concept = projects.find((p) => p.schemaType === "CreativeWork");
    if (concept) {
      const cblob = JSON.stringify(resolveSeoForPath(`/projects/${concept.slug}`).jsonLd);
      expect(cblob).toContain('"@type":"CreativeWork"');
      expect(cblob).not.toContain('"@type":"Offer"');
    }
  });

  it("project JSON-LD includes Offer only when isPubliclyAvailable is true", () => {
    const pulse = loadProjectContent().find((p) => p.slug === "dbspulse");
    expect(pulse).toBeTruthy();
    const localized = {
      id: pulse!.id,
      slug: pulse!.slug,
      name: pulse!.name.en,
      subtitle: pulse!.subtitle.en,
      desc: pulse!.desc.en,
      problem: pulse!.problem.en,
      approach: pulse!.approach.en,
      result: pulse!.result.en,
      role: pulse!.role.en,
      tech: pulse!.tech,
      tags: pulse!.tags,
      status: pulse!.status,
      maturity: pulse!.maturity,
      schemaType: pulse!.schemaType,
      isPubliclyAvailable: true,
      featured: pulse!.featured,
      order: pulse!.order,
      image_url: pulse!.image_url,
    };
    const seo = resolvePageSeo("en", "project", { project: localized, path: "/en/projects/dbspulse" });
    const blob = JSON.stringify(seo.jsonLd);
    expect(blob).toContain('"@type":"Offer"');
    expect(blob).toContain('"price":"0"');
  });

  it("article detail SEO emits Article JSON-LD and noindexes drafts", () => {
    const path = "/en/articles/ai-layer-without-boiling-the-ocean";
    const seo = resolveSeoForPath(path);
    expect(seo.robots).toBe("noindex, follow");
    const blob = JSON.stringify(seo.jsonLd);
    expect(blob).toContain('"@type":"Article"');
    expect(blob).toContain("datePublished");
    expect(blob).toContain("#person");
  });

  it("marks notFound pages with robots noindex, follow", () => {
    const fa = resolvePageSeo("fa", "notFound");
    const en = resolvePageSeo("en", "notFound");
    expect(fa.robots).toBe("noindex, follow");
    expect(en.robots).toBe("noindex, follow");
    expect(resolvePageSeo("fa", "home").robots).toBeUndefined();
    expect(resolveSeoForPath("/missing-page").robots).toBe("noindex, follow");
    expect(resolveSeoForPath("/en/missing-page").robots).toBe("noindex, follow");
  });
});
