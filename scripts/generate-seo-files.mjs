/**
 * Generate public/robots.txt and public/sitemap.xml from SITE_URL.
 * Run before build / check:urls so those files never hardcode a domain.
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, getSiteUrl } from "./site-url.mjs";

const site = getSiteUrl();

const routes = ["/", "/projects", "/about", "/en", "/en/projects", "/en/about"];

const robots = `User-agent: *
Allow: /

Sitemap: ${site}/sitemap.xml
`;

const urlEntries = routes
  .map((route) => {
    const loc = route === "/" ? `${site}/` : `${site}${route}`;
    const priority = route === "/" || route === "/en" ? "1.0" : "0.8";
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

console.log(`SEO files written with SITE_URL=${site}`);
