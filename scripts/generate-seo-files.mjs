/**
 * Generate public/robots.txt and public/sitemap.xml from SITE_URL.
 * Static paths come from shared/site-routes.json (single route manifest).
 * Includes **published** project slugs only; emits <lastmod> when updatedAt is set.
 */
import fs from "node:fs";
import path from "node:path";
import { loadProjectsFromDisk, getPublishedProjectSlugs } from "./project-content.mjs";
import { sitemapStaticPaths } from "./site-routes.mjs";
import { ROOT, getSiteUrl } from "./site-url.mjs";

const site = getSiteUrl();

function loadPublishedProjects() {
  const published = new Set(getPublishedProjectSlugs(ROOT));
  return loadProjectsFromDisk(ROOT)
    .map((e) => e.raw)
    .filter((p) => published.has(p.slug));
}

const projects = loadPublishedProjects();
const projectRoutes = projects.map((p) => ({
  path: `/projects/${p.slug}`,
  lastmod: typeof p.updatedAt === "string" && p.updatedAt.trim() ? p.updatedAt.trim() : null,
}));

const staticPaths = sitemapStaticPaths();

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /*.php$

Sitemap: ${site}/sitemap.xml
`;

function urlEntry(route, lastmod, priority) {
  const loc = route === "/" ? `${site}/` : `${site}${route}`;
  const lastmodLine = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>
    <loc>${loc}</loc>${lastmodLine}
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
].join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

const publicDir = path.join(ROOT, "public");
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");

console.log(
  `SEO files written with SITE_URL=${site} (${staticPaths.length + projectRoutes.length * 2} URLs, ${projects.length} published projects)`
);
