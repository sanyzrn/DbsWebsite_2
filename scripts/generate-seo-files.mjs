/**
 * Generate public/robots.txt and public/sitemap.xml from SITE_URL.
 * Static paths come from shared/site-routes.json (single route manifest).
 * Includes **published** project + article slugs only; emits <lastmod> when available.
 * Each <url> includes xhtml:link hreflang alternates (fa + en) — Google's preferred method.
 */
import fs from "node:fs";
import path from "node:path";
import { getPublishedArticleSlugs, validateAllArticleContent } from "./article-content.mjs";
import { loadProjectsFromDisk, getPublishedProjectSlugs } from "./project-content.mjs";
import { sitemapStaticPaths } from "./site-routes.mjs";
import { ROOT, getSiteUrl } from "./site-url.mjs";
import { absoluteLoc, hreflangPair } from "./sitemap-hreflang.mjs";

const site = getSiteUrl();

function loadPublishedProjects() {
  const published = new Set(getPublishedProjectSlugs(ROOT));
  return loadProjectsFromDisk(ROOT)
    .map((e) => e.raw)
    .filter((p) => published.has(p.slug));
}

function loadPublishedArticleRoutes() {
  const published = new Set(getPublishedArticleSlugs(ROOT));
  const articles = validateAllArticleContent(ROOT).filter((a) => published.has(a.slug));
  const bySlug = new Map();
  for (const a of articles) {
    const lastmod = (a.updated || a.date || "").trim() || null;
    const prev = bySlug.get(a.slug);
    if (!prev || (lastmod && (!prev.lastmod || lastmod > prev.lastmod))) {
      bySlug.set(a.slug, { path: `/articles/${a.slug}`, lastmod });
    }
  }
  return [...bySlug.values()];
}

const projects = loadPublishedProjects();
const projectRoutes = projects.map((p) => ({
  path: `/projects/${p.slug}`,
  lastmod: typeof p.updatedAt === "string" && p.updatedAt.trim() ? p.updatedAt.trim() : null,
}));

const articleRoutes = loadPublishedArticleRoutes();

const staticPaths = sitemapStaticPaths();

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /*.php$

Sitemap: ${site}/sitemap.xml
`;

function urlEntry(route, lastmod, priority) {
  const loc = absoluteLoc(route);
  const { fa, en } = hreflangPair(route);
  const lastmodLine = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>
    <loc>${loc}</loc>${lastmodLine}
    <xhtml:link rel="alternate" hreflang="fa" href="${fa}" />
    <xhtml:link rel="alternate" hreflang="en" href="${en}" />
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const urlEntries = [
  ...staticPaths.map((route) => {
    const priority = route === "/" || route === "/en" ? "1.0" : "0.8";
    return urlEntry(route, null, priority);
  }),
  ...projectRoutes.flatMap(({ path: projectPath, lastmod }) => {
    const fa = urlEntry(projectPath, lastmod, "0.7");
    const en = urlEntry(`/en${projectPath}`, lastmod, "0.7");
    return [fa, en];
  }),
  ...articleRoutes.flatMap(({ path: articlePath, lastmod }) => {
    const fa = urlEntry(articlePath, lastmod, "0.7");
    const en = urlEntry(`/en${articlePath}`, lastmod, "0.7");
    return [fa, en];
  }),
].join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>
`;

const publicDir = path.join(ROOT, "public");
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");

console.log(
  `SEO files written with SITE_URL=${site} (${staticPaths.length + projectRoutes.length * 2 + articleRoutes.length * 2} URLs, ${projects.length} published projects, ${articleRoutes.length} published articles)`
);
