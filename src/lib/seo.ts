import type { Lang } from "./i18n";
import { dictionaries } from "./i18n";
import { findArticle, loadArticles, type Article } from "./articles";
import { langFromPath, localePath, stripLangPrefix } from "./paths";
import { loadProjectContent, localizeProject, type LocalizedProject } from "./projects";
import { getSiteUrl } from "./siteUrl";
import { truncateDescription } from "./truncate";
import siteRoutes from "../../shared/site-routes.json";

export type PageSeoKey =
  | "home"
  | "projects"
  | "articles"
  | "news"
  | "about"
  | "contact"
  | "project"
  | "article"
  | "privacy"
  | "terms"
  | "notFound";

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
  /** When set, emitted as <meta name="robots" …> (e.g. 404 pages). */
  robots?: string;
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
  opts?: { project?: LocalizedProject; article?: Article; path?: string }
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
  } else if (page === "articles" && seo.articles) {
    title = seo.articles.title;
    description = seo.articles.description;
    path = opts?.path ?? localePath(lang, "/articles");
  } else if (page === "news" && seo.news) {
    title = seo.news.title;
    description = seo.news.description;
    path = opts?.path ?? localePath(lang, "/news");
  } else if (page === "about" && seo.about) {
    title = seo.about.title;
    description = seo.about.description;
    path = opts?.path ?? localePath(lang, "/about");
  } else if (page === "contact" && seo.contact) {
    title = seo.contact.title;
    description = seo.contact.description;
    path = opts?.path ?? localePath(lang, "/contact");
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
    description =
      truncateDescription(opts.project.desc, 155) || (seo.projects?.description ?? seo.description);
    path = opts.path ?? localePath(lang, `/projects/${opts.project.slug}`);
  } else if (page === "article" && opts?.article) {
    const fm = opts.article.frontmatter;
    title = `${fm.title} | Saeed Zarrini`;
    description = truncateDescription(fm.description, 155) || (seo.articles?.description ?? seo.description);
    path = opts.path ?? localePath(lang, `/articles/${opts.article.slug}`);
  } else if (page === "home") {
    path = opts?.path ?? localePath(lang, "/");
  }

  const bare = path === "/en" || path.startsWith("/en/") ? path.slice(3) || "/" : path;
  const pathFa = bare === "/" ? "/" : bare;
  const pathEn = bare === "/" ? "/en" : `/en${bare}`;

  const jsonLd = buildJsonLd(lang, page, path, opts?.project, opts?.article);

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
    ...(page === "notFound" ||
    (page === "project" && opts?.project && opts.project.maturity !== "published") ||
    (page === "article" && opts?.article && opts.article.frontmatter.status !== "published")
      ? { robots: "noindex, follow" }
      : {}),
  };
}

function buildJsonLd(
  lang: Lang,
  page: PageSeoKey,
  path: string,
  project?: LocalizedProject,
  article?: Article
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

  if (page === "article" && article) {
    const fm = article.frontmatter;
    const articleLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${origin}${path}`,
      headline: fm.title,
      description: fm.description,
      datePublished: fm.date,
      dateModified: fm.updated ?? fm.date,
      url: `${origin}${path}`,
      inLanguage: lang,
      author: { "@id": `${origin}/#person` },
      creator: { "@id": `${origin}/#person` },
      publisher: { "@id": `${origin}/#organization` },
      mainEntityOfPage: { "@type": "WebPage", "@id": `${origin}${path}` },
      keywords: fm.tags.join(", "),
    };
    return [articleLd, { "@context": "https://schema.org", "@graph": [person, organization] }];
  }

  return [{ "@context": "https://schema.org", "@graph": [person, organization, website] }];
}

/** All static paths to prerender (locale-aware). */
export function listPrerenderPaths(): string[] {
  const projects = loadProjectContent();
  const articleSlugs = [...new Set(loadArticles().map((a) => a.slug))];
  const staticBare = [...siteRoutes.staticPaths, ...siteRoutes.specialPaths];
  const paths = staticBare.flatMap((p) => [p, p === "/" ? "/en" : `/en${p}`]);
  for (const p of projects) {
    paths.push(`/projects/${p.slug}`, `/en/projects/${p.slug}`);
  }
  for (const slug of articleSlugs) {
    paths.push(`/articles/${slug}`, `/en/articles/${slug}`);
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
  if (bare === "/articles") {
    return resolvePageSeo(lang, "articles", { path });
  }
  if (bare === "/news") {
    return resolvePageSeo(lang, "news", { path });
  }
  if (bare === "/about") {
    return resolvePageSeo(lang, "about", { path });
  }
  if (bare === "/contact") {
    return resolvePageSeo(lang, "contact", { path });
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
  const articleMatch = bare.match(/^\/articles\/([^/]+)\/?$/);
  if (articleMatch) {
    const article = findArticle(lang, articleMatch[1]);
    if (article) {
      return resolvePageSeo(lang, "article", { article, path });
    }
  }
  return resolvePageSeo(lang, "notFound", { path });
}
