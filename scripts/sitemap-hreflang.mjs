/**
 * Locale alternate helpers for sitemap.xml xhtml:link annotations.
 * Keep in sync with head hreflang tags (fa ↔ en pairs).
 */
import { getSiteUrl } from "./site-url.mjs";

/** Absolute loc for a site path (`/` → `${site}/`). */
export function absoluteLoc(route, site = getSiteUrl()) {
  return route === "/" ? `${site}/` : `${site}${route}`;
}

/**
 * Map any locale path to its fa / en pair for xhtml:link alternates.
 * `/en` ↔ `/`, `/en/projects/x` ↔ `/projects/x`.
 */
export function hreflangPair(route, site = getSiteUrl()) {
  const isEn = route === "/en" || route.startsWith("/en/");
  const bare = isEn ? (route === "/en" ? "/" : route.slice(3) || "/") : route;
  const faPath = bare === "/" ? "/" : bare;
  const enPath = bare === "/" ? "/en" : `/en${bare}`;
  return { fa: absoluteLoc(faPath, site), en: absoluteLoc(enPath, site) };
}
