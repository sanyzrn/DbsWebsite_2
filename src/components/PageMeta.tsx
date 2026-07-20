import { useApp } from "../lib/app";
import { findArticle } from "../lib/articles";
import {
  localizedProjectForLang,
  resolvePageSeo,
  type PageSeoKey,
} from "../lib/seo";

type PageMetaProps = {
  page: PageSeoKey;
  /** Project or article slug when `page` is `"project"` / `"article"`. */
  slug?: string;
};

/** Emits document head tags (React 19 hoists these) + JSON-LD for the current page.
 *  Skipped during SSR — `scripts/prerender.mjs` injects the authoritative head per route.
 */
export function PageMeta({ page, slug }: PageMetaProps) {
  const { lang } = useApp();
  const project = page === "project" && slug ? localizedProjectForLang(lang, slug) : undefined;
  const article = page === "article" && slug ? findArticle(lang, slug) : undefined;
  const seo = resolvePageSeo(lang, page, {
    ...(project ? { project } : {}),
    ...(article ? { article } : {}),
  });

  if (import.meta.env.SSR) {
    return null;
  }

  const ogType = page === "project" || page === "article" ? "article" : "website";

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {seo.robots ? <meta name="robots" content={seo.robots} /> : null}
      <link rel="canonical" href={seo.canonical} />
      <link rel="alternate" hrefLang="fa" href={seo.alternateFa} />
      <link rel="alternate" hrefLang="en" href={seo.alternateEn} />
      <link rel="alternate" hrefLang="x-default" href={seo.alternateFa} />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content={seo.ogLocale} />
      <meta property="og:locale:alternate" content={seo.ogLocaleAlternate} />
      <meta property="og:site_name" content="Saeed Zarrini" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.canonical} />
      <meta property="og:image" content={seo.image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      {seo.jsonLd.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </>
  );
}
