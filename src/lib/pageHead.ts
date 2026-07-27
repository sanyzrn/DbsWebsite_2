import type { PageSeo } from "./seo";

/**
 * Imperative document-head sync for the current route.
 *
 * The build-time prerender (`scripts/prerender.mjs`) writes the authoritative head
 * for the initial route, so `PageMeta` must not *render* those tags — a React tree
 * on the client where the server rendered nothing is a hydration mismatch, and React
 * would then discard the whole prerendered DOM. Instead the tags are updated in place
 * here, after hydration and on every client-side navigation.
 *
 * Tags this module creates are marked with `data-page-head` so they are
 * distinguishable from the prerendered ones it adopts.
 */
const MANAGED_ATTR = "data-page-head";

function setMeta(attr: "name" | "property", key: string, content: string | null): void {
  const existing = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${CSS.escape(key)}"]`
  );

  if (content === null) {
    existing?.remove();
    return;
  }

  if (existing) {
    existing.setAttribute("content", content);
    return;
  }

  const el = document.createElement("meta");
  el.setAttribute(attr, key);
  el.setAttribute("content", content);
  el.setAttribute(MANAGED_ATTR, "");
  document.head.appendChild(el);
}

function setLink(rel: string, href: string | null, hreflang?: string): void {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  const existing = document.head.querySelector<HTMLLinkElement>(selector);

  if (href === null) {
    existing?.remove();
    return;
  }

  if (existing) {
    existing.setAttribute("href", href);
    return;
  }

  const el = document.createElement("link");
  el.setAttribute("rel", rel);
  if (hreflang) el.setAttribute("hreflang", hreflang);
  el.setAttribute("href", href);
  el.setAttribute(MANAGED_ATTR, "");
  document.head.appendChild(el);
}

/**
 * Replace the head's JSON-LD with one `<script>` per block — never several blocks
 * in a single tag, which produces unparseable JSON.
 *
 * No string escaping is needed: assigning `textContent` bypasses the HTML parser,
 * so `<`, `</script>` and U+2028/2029 cannot break out of the element (unlike the
 * prerender path, which builds HTML as a string and escapes in `jsonld-serialize.mjs`).
 */
function setJsonLd(blocks: Record<string, unknown>[]): void {
  document.head
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((el) => el.remove());

  for (const block of blocks) {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute(MANAGED_ATTR, "");
    el.textContent = JSON.stringify(block);
    document.head.appendChild(el);
  }
}

/** Sync `<title>`, meta, canonical/hreflang and JSON-LD to `seo`. Client-only. */
export function applyPageHead(seo: PageSeo, ogType: "article" | "website"): void {
  if (typeof document === "undefined") return;

  const isNoindex = typeof seo.robots === "string" && seo.robots.includes("noindex");

  document.title = seo.title;

  setMeta("name", "description", seo.description);
  setMeta("name", "robots", seo.robots ?? null);

  // Noindex pages (404) must not advertise a canonical or locale alternates.
  setLink("canonical", isNoindex ? null : seo.canonical);
  setLink("alternate", isNoindex ? null : seo.alternateFa, "fa");
  setLink("alternate", isNoindex ? null : seo.alternateEn, "en");
  setLink("alternate", isNoindex ? null : seo.alternateEn, "x-default");

  setMeta("property", "og:type", ogType);
  setMeta("property", "og:locale", seo.ogLocale);
  setMeta("property", "og:locale:alternate", seo.ogLocaleAlternate);
  setMeta("property", "og:site_name", "Saeed Zarrini");
  setMeta("property", "og:title", seo.title);
  setMeta("property", "og:description", seo.description);
  setMeta("property", "og:url", seo.canonical);
  setMeta("property", "og:image", seo.image);

  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", seo.title);
  setMeta("name", "twitter:description", seo.description);
  setMeta("name", "twitter:image", seo.image);

  setJsonLd(seo.jsonLd);
}
