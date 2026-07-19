import type { Lang } from "./i18n";
import { dictionaries } from "./i18n";
import { langFromPath, localePath, stripLangPrefix } from "./paths";
import { loadProjectContent, localizeProject, type LocalizedProject } from "./projects";
import { getSiteUrl } from "./siteUrl";

export type PageSeoKey = "home" | "projects" | "about" | "project" | "privacy" | "terms" | "notFound";

export type PageSeo = {
  lang: Lang;
  title: string;
  description: string;
  /** Pathname including locale prefix, e.g. /en/projects/dbspulse */
  path: string;
  alternatePath: string;
  ogLocale: string;
  ogLocaleAlternate: string;
  image: string;
  canonical: string;
  alternateFa: string;
  alternateEn: string;
  jsonLd: Record<string, unknown>[];
};

function site() {
  try {
    return getSiteUrl();
  } catch {
    return (typeof process !== "undefined" && process.env?.SITE_URL?.replace(/\/+$/, "")) || "https://dbsgraphic.ir";
  }
}

export function resolvePageSeo(
  lang: Lang,
  page: PageSeoKey,
  opts?: { project?: LocalizedProject; path?: string }
): PageSeo {
  const seo = dictionaries[lang].seo;
  const origin = site();
  let title = seo.title;
  let description = seo.description;
  let path = opts?.path ?? localePath(lang, "/");

  if (page === "projects" && seo.projects) {
    title = seo.projects.title;
    description = seo.projects.description;
    path = opts?.path ?? localePath(lang, "/projects");
  } else if (page === "about" && seo.about) {
    title = seo.about.title;
    description = seo.about.description;
    path = opts?.path ?? localePath(lang, "/about");
  } else if (page === "privacy" && seo.privacy) {
    title = seo.privacy.title;
    description = seo.privacy.description;
    path = opts?.path ?? localePath(lang, "/privacy");
  } else if (page === "terms" && seo.terms) {
    title = seo.terms.title;
    description = seo.terms.description;
    path = opts?.path ?? localePath(lang, "/terms");
  } else if (page === "notFound" && seo.notFound) {
    title = seo.notFound.title;
    description = seo.notFound.description;
    path = opts?.path ?? localePath(lang, "/404");
  } else if (page === "project" && opts?.project) {
    title = `${opts.project.name} | Saeed Zarrini`;
    description = opts.project.desc.slice(0, 155) || (seo.projects?.description ?? seo.description);
    path = opts.path ?? localePath(lang, `/projects/${opts.project.slug}`);
  } else if (page === "home") {
    path = opts?.path ?? localePath(lang, "/");
  }

  const bare = path === "/en" || path.startsWith("/en/") ? path.slice(3) || "/" : path;
  const pathFa = bare === "/" ? "/" : bare;
  const pathEn = bare === "/" ? "/en" : `/en${bare}`;

  const jsonLd = buildJsonLd(lang, page, path, opts?.project);

  return {
    lang,
    title,
    description,
    path,
    alternatePath: lang === "fa" ? pathEn : pathFa,
    ogLocale: lang === "fa" ? "fa_IR" : "en_US",
    ogLocaleAlternate: lang === "fa" ? "en_US" : "fa_IR",
    image: `${origin}/og.jpg`,
    canonical: `${origin}${path === "/" ? "/" : path}`,
    alternateFa: `${origin}${pathFa === "/" ? "/" : pathFa}`,
    alternateEn: `${origin}${pathEn}`,
    jsonLd,
  };
}

function buildJsonLd(
  lang: Lang,
  page: PageSeoKey,
  path: string,
  project?: LocalizedProject
): Record<string, unknown>[] {
  const origin = site();
  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": `${origin}/#person`,
    name: "Saeed Zarrini",
    alternateName: "سعید زرینی",
    url: `${origin}/`,
    email: "zrn_sany@yahoo.com",
    telephone: "+989301221816",
    jobTitle: "AI Solutions Engineer & Digital Product Builder",
    worksFor: { "@id": `${origin}/#organization` },
    sameAs: ["https://github.com/sanyzrn/", "https://www.linkedin.com/in/saeed-zarrini-20a56341", `${origin}/`],
  };

  const organization: Record<string, unknown> = {
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${origin}/#organization`,
    name: "DBSGraphic",
    url: `${origin}/`,
    founder: { "@id": `${origin}/#person` },
    description:
      lang === "fa"
        ? "استودیو خلاقیت و محصول — طراحی، مهندسی و هوش مصنوعی"
        : "Creative & product studio — design, engineering, and AI",
  };

  const website: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    url: `${origin}/`,
    name: "Saeed Zarrini",
    inLanguage: ["fa", "en"],
    publisher: { "@id": `${origin}/#organization` },
    author: { "@id": `${origin}/#person` },
  };

  if (page === "home") {
    return [
      { "@context": "https://schema.org", "@graph": [person, organization, website] },
    ];
  }

  if (page === "project" && project) {
    const isSoftware = project.tags.some((t) =>
      ["Full-Stack", "AI", "Mobile", "Desktop", "Automation"].includes(t)
    );
    const work: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": isSoftware ? "SoftwareApplication" : "CreativeWork",
      "@id": `${origin}${path}`,
      name: project.name,
      description: project.desc,
      url: `${origin}${path}`,
      inLanguage: lang,
      author: { "@id": `${origin}/#person` },
      creator: { "@id": `${origin}/#person` },
      keywords: project.tags.join(", "),
    };
    if (isSoftware) {
      work.applicationCategory = project.tags.includes("AI") ? "BusinessApplication" : "DeveloperApplication";
      work.offers = { "@type": "Offer", price: "0", priceCurrency: "USD" };
    }
    if (project.image_url) work.image = project.image_url;
    return [work, { "@context": "https://schema.org", "@graph": [person, organization] }];
  }

  return [{ "@context": "https://schema.org", "@graph": [person, organization, website] }];
}

/** All static paths to prerender (locale-aware). */
export function listPrerenderPaths(): string[] {
  const projects = loadProjectContent();
  const paths = [
    "/",
    "/projects",
    "/about",
    "/privacy",
    "/terms",
    "/en",
    "/en/projects",
    "/en/about",
    "/en/privacy",
    "/en/terms",
    "/404",
    "/en/404",
  ];
  for (const p of projects) {
    paths.push(`/projects/${p.slug}`, `/en/projects/${p.slug}`);
  }
  return paths;
}

export function localizedProjectForLang(lang: Lang, slug: string): LocalizedProject | undefined {
  const raw = loadProjectContent().find((p) => p.slug === slug || p.id === slug);
  return raw ? localizeProject(raw, lang) : undefined;
}

/** Resolve SEO metadata from a URL pathname (used by prerender). */
export function resolveSeoForPath(pathname: string): PageSeo {
  const lang = langFromPath(pathname);
  const bare = stripLangPrefix(pathname);
  const path = pathname === "" ? "/" : pathname;

  if (bare === "/" || bare === "") {
    return resolvePageSeo(lang, "home", { path });
  }
  if (bare === "/projects") {
    return resolvePageSeo(lang, "projects", { path });
  }
  if (bare === "/about") {
    return resolvePageSeo(lang, "about", { path });
  }
  if (bare === "/privacy") {
    return resolvePageSeo(lang, "privacy", { path });
  }
  if (bare === "/terms") {
    return resolvePageSeo(lang, "terms", { path });
  }
  if (bare === "/404") {
    return resolvePageSeo(lang, "notFound", { path });
  }
  const projectMatch = bare.match(/^\/projects\/([^/]+)\/?$/);
  if (projectMatch) {
    const project = localizedProjectForLang(lang, projectMatch[1]);
    if (project) {
      return resolvePageSeo(lang, "project", { project, path });
    }
  }
  return resolvePageSeo(lang, "notFound", { path });
}

/** @deprecated Prefer PageMeta — kept for any residual callers */
export function applyDocumentSeo(lang: Lang, page: PageSeoKey, projectName?: string) {
  if (typeof document === "undefined") return;
  const project = projectName
    ? ({ name: projectName, desc: "", slug: "" } as LocalizedProject)
    : undefined;
  const meta = resolvePageSeo(lang, page, project ? { project } : undefined);
  document.title = meta.title;
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
  ensureMeta({ name: "description" }).setAttribute("content", meta.description);
  ensureMeta({ property: "og:title" }).setAttribute("content", meta.title);
  ensureMeta({ property: "og:description" }).setAttribute("content", meta.description);
  ensureMeta({ property: "og:locale" }).setAttribute("content", meta.ogLocale);
  ensureMeta({ name: "twitter:title" }).setAttribute("content", meta.title);
  ensureMeta({ name: "twitter:description" }).setAttribute("content", meta.description);
  document.querySelector('meta[name="keywords"]')?.remove();
}
