import { useApp } from "../lib/app";
import {
  localizedProjectForLang,
  resolvePageSeo,
  type PageSeoKey,
} from "../lib/seo";

type PageMetaProps = {
  page: PageSeoKey;
  /** Project slug when `page` is `"project"`. */
  slug?: string;
};

/** Emits document head tags (React 19 hoists these) + JSON-LD for the current page. */
export function PageMeta({ page, slug }: PageMetaProps) {
  const { lang } = useApp();
  const project = page === "project" && slug ? localizedProjectForLang(lang, slug) : undefined;
  const seo = resolvePageSeo(lang, page, project ? { project } : undefined);

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.canonical} />
      <link rel="alternate" hrefLang="fa" href={seo.alternateFa} />
      <link rel="alternate" hrefLang="en" href={seo.alternateEn} />
      <link rel="alternate" hrefLang="x-default" href={seo.alternateFa} />
      <meta property="og:type" content={page === "project" ? "article" : "website"} />
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
