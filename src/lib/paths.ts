import type { Lang } from "./i18n";

/** Strip optional `/en` prefix from a pathname. */
export function stripLangPrefix(pathname: string): string {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const rest = pathname.slice(3) || "/";
    return rest.startsWith("/") ? rest : `/${rest}`;
  }
  return pathname;
}

/** Locale from URL: `/en…` → en, otherwise fa. */
export function langFromPath(pathname: string): Lang {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fa";
}

/** Build a locale-aware path. `path` should be `/`, `/projects`, `/about`, etc. */
export function localePath(lang: Lang, path = "/"): string {
  const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  if (lang === "en") {
    if (normalized === "/") return "/en";
    return `/en${normalized}`;
  }
  return normalized;
}
