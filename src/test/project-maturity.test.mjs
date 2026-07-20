import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  findPlaceholderHits,
  getPublishedProjectSlugs,
  validateAllProjectContent,
} from "../../scripts/project-content.mjs";

const tmpDirs = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function writeTempProjects(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "proj-content-"));
  tmpDirs.push(root);
  const dir = path.join(root, "content", "projects");
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, data] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2));
  }
  return root;
}

const baseProject = {
  id: "sample",
  slug: "sample",
  status: "production",
  featured: false,
  order: 1,
  name: { fa: "نمونه", en: "Sample" },
  subtitle: { fa: "زیرعنوان", en: "Subtitle" },
  desc: { fa: "توضیح کامل", en: "Full description" },
  problem: { fa: "مشکل واقعی", en: "Real problem" },
  approach: { fa: "رویکرد واقعی", en: "Real approach" },
  result: { fa: "نتیجه واقعی", en: "Real result" },
  role: { fa: ["طراحی"], en: ["Design"] },
  tech: ["React"],
  tags: ["Design"],
  image_url: null,
  schemaType: "CreativeWork",
  isPubliclyAvailable: false,
};

describe("project content maturity gates", () => {
  it("fails validation when a published project contains a _todo marker", () => {
    const root = writeTempProjects({
      "bad.json": {
        ...baseProject,
        maturity: "published",
        result: { fa: "نتیجه", en: "Result with _todo still pending" },
      },
    });

    expect(() => validateAllProjectContent(root)).toThrow(/published/i);
    expect(() => validateAllProjectContent(root)).toThrow(/_todo/i);
  });

  it("allows draft projects to keep placeholder markers", () => {
    const root = writeTempProjects({
      "draft.json": {
        ...baseProject,
        id: "draft",
        slug: "draft",
        maturity: "draft",
        desc: { fa: "جزئیات به‌زودی", en: "details soon" },
        _todo: "Placeholder case-study copy",
      },
    });

    const projects = validateAllProjectContent(root);
    expect(projects).toHaveLength(1);
    expect(projects[0].maturity).toBe("draft");
    expect(findPlaceholderHits(projects[0]).length).toBeGreaterThan(0);
  });

  it("excludes draft projects from published sitemap slugs", () => {
    const root = writeTempProjects({
      "live.json": { ...baseProject, id: "live", slug: "live", maturity: "published" },
      "wip.json": {
        ...baseProject,
        id: "wip",
        slug: "wip",
        order: 2,
        maturity: "draft",
        desc: { fa: "جزئیات به‌زودی", en: "details soon" },
        _todo: "still drafting",
      },
    });

    expect(getPublishedProjectSlugs(root)).toEqual(["live"]);
    expect(getPublishedProjectSlugs(root)).not.toContain("wip");
  });

  it("accepts optional case-study metadata fields when present", () => {
    const root = writeTempProjects({
      "meta.json": {
        ...baseProject,
        maturity: "published",
        year: "2025",
        durationMonths: 4,
        teamSize: "Solo",
        clientType: {
          fa: "شرکت دارویی، منابع انسانی داخلی",
          en: "Pharmaceutical company, internal HR department",
        },
        links: [
          {
            label: { fa: "مخزن", en: "Repository" },
            href: "https://github.com/example/demo",
          },
        ],
      },
    });

    const projects = validateAllProjectContent(root);
    expect(projects[0].year).toBe("2025");
    expect(projects[0].durationMonths).toBe(4);
    expect(projects[0].teamSize).toBe("Solo");
    expect(projects[0].clientType.en).toMatch(/Pharmaceutical/);
    expect(projects[0].links).toHaveLength(1);
  });

  it("rejects invalid optional metadata (non-positive duration or bad link href)", () => {
    const badDuration = writeTempProjects({
      "bad-duration.json": { ...baseProject, maturity: "draft", durationMonths: 0 },
    });
    expect(() => validateAllProjectContent(badDuration)).toThrow(/durationMonths/i);

    const badLink = writeTempProjects({
      "bad-link.json": {
        ...baseProject,
        maturity: "draft",
        links: [{ label: { fa: "لینک", en: "Link" }, href: "not-a-url" }],
      },
    });
    expect(() => validateAllProjectContent(badLink)).toThrow(/href/i);
  });
});
