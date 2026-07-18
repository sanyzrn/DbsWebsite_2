import { dictionaries, type Lang } from "./i18n";

export type PageSeoKey = "home" | "projects" | "about" | "project";

export function applyDocumentSeo(lang: Lang, page: PageSeoKey, projectName?: string) {
  const seo = dictionaries[lang].seo;
  let title = seo.title;
  let description = seo.description;

  if (page === "projects" && seo.projects) {
    title = seo.projects.title;
    description = seo.projects.description;
  } else if (page === "about" && seo.about) {
    title = seo.about.title;
    description = seo.about.description;
  } else if (page === "project" && projectName) {
    title = `${projectName} | Saeed Zarrini`;
    description = seo.projects?.description ?? seo.description;
  }

  document.title = title;

  const ensureMeta = (attrs: { name?: string; property?: string }) => {
    const selector = attrs.name ? `meta[name="${attrs.name}"]` : `meta[property="${attrs.property}"]`;
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      if (attrs.name) el.setAttribute("name", attrs.name);
      if (attrs.property) el.setAttribute("property", attrs.property!);
      document.head.appendChild(el);
    }
    return el;
  };

  ensureMeta({ name: "description" }).setAttribute("content", description);
  ensureMeta({ property: "og:title" }).setAttribute("content", title);
  ensureMeta({ property: "og:description" }).setAttribute("content", description);
  ensureMeta({ property: "og:locale" }).setAttribute("content", lang === "fa" ? "fa_IR" : "en_US");
  ensureMeta({ name: "twitter:title" }).setAttribute("content", title);
  ensureMeta({ name: "twitter:description" }).setAttribute("content", description);
  document.querySelector('meta[name="keywords"]')?.remove();
}
