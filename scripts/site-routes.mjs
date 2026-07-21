/**
 * Shared site route helpers — single manifest in shared/site-routes.json.
 * Used by generate-seo-files, prerender path listing, and App route wiring.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(here, "..", "shared", "site-routes.json");

/**
 * @type {{
 *   staticPaths: string[],
 *   specialPaths: string[],
 *   dynamicPaths?: { path: string, page: string }[],
 *   seoKeys: Record<string, string>,
 *   pageKeys?: Record<string, string>
 * }}
 */
export const siteRoutes = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

export function localePath(lang, barePath) {
  if (lang === "en") return barePath === "/" ? "/en" : `/en${barePath}`;
  return barePath;
}

/** Both locales for every static path in the manifest. */
export function allLocaleStaticPaths() {
  return siteRoutes.staticPaths.flatMap((p) => [p, localePath("en", p)]);
}

/** Static + special (404) for both locales. */
export function allLocalePrerenderStaticPaths() {
  const paths = [...siteRoutes.staticPaths, ...siteRoutes.specialPaths];
  return paths.flatMap((p) => [p, localePath("en", p)]);
}

/** Sitemap-only static paths (exclude 404). */
export function sitemapStaticPaths() {
  return allLocaleStaticPaths();
}
