/**
 * Generate public/robots.txt and public/sitemap.xml from SITE_URL.
 * Includes every locale route (home, projects index, about, privacy, terms, project slugs).
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, getSiteUrl } from "./site-url.mjs";

const site = getSiteUrl();

function loadProjectSlugs() {
  const dir = path.join(ROOT, "content", "projects");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      return raw.slug || raw.id;
    })
    .filter(Boolean)
    .sort();
}

const staticRoutes = ["/", "/projects", "/about", "/privacy", "/terms"];
const slugs = loadProjectSlugs();
const projectRoutes = slugs.map((slug) => `/projects/${slug}`);

const faRoutes = [...staticRoutes, ...projectRoutes];
const enRoutes = faRoutes.map((route) => (route === "/" ? "/en" : `/en${route}`));
const routes = [...faRoutes, ...enRoutes];

const robots = `User-agent: *
Allow: /

Sitemap: ${site}/sitemap.xml
`;

const urlEntries = routes
  .map((route) => {
    const loc = route === "/" ? `${site}/` : `${site}${route}`;
    const priority =
      route === "/" || route === "/en" ? "1.0" : route.includes("/projects/") ? "0.7" : "0.8";
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

const publicDir = path.join(ROOT, "public");
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");

console.log(`SEO files written with SITE_URL=${site} (${routes.length} URLs)`);
