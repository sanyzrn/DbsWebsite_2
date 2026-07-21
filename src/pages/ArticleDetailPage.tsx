import { Link, Navigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { PageMeta } from "../components/PageMeta";
import { articleMdxComponents } from "../components/mdx/components";
import { DirArrow, Reveal } from "../components/ui";
import { useApp } from "../lib/app";
import { findArticle, getPublishedArticles } from "../lib/articles";
import { formatArticleDate } from "../lib/formatDate";
import { localePath } from "../lib/paths";
import { getLocalizedProjects } from "../lib/projects";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useApp();
  // Look up drafts too so review URLs remain reachable (noindex via SEO).
  const article = slug ? findArticle(lang, slug) : undefined;

  if (!article || !slug) {
    return <Navigate to={localePath(lang, "/articles")} replace />;
  }

  const { frontmatter: fm, Component } = article;
  const relatedProjects = getLocalizedProjects(lang)
    .filter((p) => p.tags.some((tag) => fm.tags.includes(tag)))
    .slice(0, 3);

  const relatedArticles = getPublishedArticles(lang)
    .filter((a) => a.slug !== slug && a.frontmatter.tags.some((tag) => fm.tags.includes(tag)))
    .slice(0, 3);

  return (
    <>
      <PageMeta page="article" slug={slug} />
      <div className="wrap section-pad">
        <Breadcrumbs
          items={[
            { label: t.nav.home, to: localePath(lang, "/") },
            { label: t.nav.articles, to: localePath(lang, "/articles") },
            { label: fm.title },
          ]}
        />

        <Reveal delay={60}>
          <header className="mx-auto mt-8 max-w-[70ch]">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink3">
              {formatArticleDate(fm.date, lang)}
              <span className="mx-2 text-line2">·</span>
              {t.articles.readingTime.replace("{n}", String(fm.readingTimeMinutes))}
            </p>
            <h1 className="mt-4 text-[32px] font-black leading-[1.2] tracking-tight md:text-[40px]">{fm.title}</h1>
            <p className="mt-4 text-[16px] font-medium leading-8 text-ink2 md:text-[17px]">{fm.description}</p>
            {fm.tags.length > 0 ? (
              <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink3">
                {fm.tags.join(" · ")}
              </p>
            ) : null}
          </header>
        </Reveal>

        <Reveal delay={120}>
          <div className="article-prose mx-auto mt-10 max-w-[70ch]">
            <Component components={articleMdxComponents} />
          </div>
        </Reveal>

        {relatedProjects.length > 0 ? (
          <Reveal delay={180}>
            <aside className="mx-auto mt-14 max-w-[70ch] border-t border-line pt-10">
              <h2 className="text-[14px] font-bold uppercase tracking-[0.14em] text-ink3">{t.articles.relatedProjects}</h2>
              <ul className="mt-4 space-y-3">
                {relatedProjects.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to={localePath(lang, `/projects/${p.slug}`)}
                      className="group inline-flex items-center gap-2 text-[15px] font-bold text-ink transition-colors hover:text-hi"
                    >
                      {p.name}
                      <DirArrow className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
                    </Link>
                    <p className="mt-0.5 text-[13px] leading-6 text-ink2">{p.subtitle}</p>
                  </li>
                ))}
              </ul>
            </aside>
          </Reveal>
        ) : relatedArticles.length > 0 ? (
          <Reveal delay={180}>
            <aside className="mx-auto mt-14 max-w-[70ch] border-t border-line pt-10">
              <h2 className="text-[14px] font-bold uppercase tracking-[0.14em] text-ink3">{t.articles.pageTitle}</h2>
              <ul className="mt-4 space-y-3">
                {relatedArticles.map((a) => (
                  <li key={a.slug}>
                    <Link
                      to={localePath(lang, `/articles/${a.slug}`)}
                      className="group inline-flex items-center gap-2 text-[15px] font-bold text-ink transition-colors hover:text-hi"
                    >
                      {a.frontmatter.title}
                      <DirArrow className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </Reveal>
        ) : null}
      </div>
    </>
  );
}
