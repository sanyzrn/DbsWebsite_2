import { Link, Navigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { PageMeta } from "../components/PageMeta";
import { articleMdxComponents } from "../components/mdx/components";
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
      <article className="pb-[clamp(72px,9vw,160px)] pt-10 md:pt-16">
        <div className="wrap">
          <Breadcrumbs
            items={[
              { label: t.nav.home, to: localePath(lang, "/") },
              { label: t.nav.articles, to: localePath(lang, "/articles") },
              { label: fm.title },
            ]}
          />

          <header className="sheet mt-10 md:mt-14">
            <div className="meta flex flex-col gap-1 lg:col-span-3 lg:pt-3">
              <time dateTime={fm.date} className="tnum">
                {formatArticleDate(fm.date, lang)}
              </time>
              <span>{t.articles.readingTime.replace("{n}", String(fm.readingTimeMinutes))}</span>
              {fm.tags.length > 0 ? <span>{fm.tags.join(", ")}</span> : null}
            </div>
            <div className="lg:col-span-9">
              <h1 className="display t-section max-w-[18ch]">{fm.title}</h1>
              <p className="lead mt-8 max-w-[56ch]">{fm.description}</p>
            </div>
          </header>

          <div className="sheet mt-14 md:mt-20">
            <div className="article-prose border-t border-ink pt-10 lg:col-span-7 lg:col-start-4">
              <Component components={articleMdxComponents} />
            </div>
          </div>

          {relatedProjects.length > 0 ? (
            <aside className="sheet mt-20">
              <div className="border-t border-line pt-8 lg:col-span-7 lg:col-start-4">
                <h2 className="meta">{t.articles.relatedProjects}</h2>
                <ul className="mt-4">
                  {relatedProjects.map((p) => (
                    <li key={p.slug} className="border-b border-line py-4">
                      <Link to={localePath(lang, `/projects/${p.slug}`)} className="text-[20px] font-semibold transition-colors hover:text-accent">
                        {p.name}
                      </Link>
                      <p className="mt-1 text-[15px] text-ink2">{p.subtitle}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          ) : relatedArticles.length > 0 ? (
            <aside className="sheet mt-20">
              <div className="border-t border-line pt-8 lg:col-span-7 lg:col-start-4">
                <h2 className="meta">{t.articles.pageTitle}</h2>
                <ul className="mt-4">
                  {relatedArticles.map((a) => (
                    <li key={a.slug} className="border-b border-line py-4">
                      <Link to={localePath(lang, `/articles/${a.slug}`)} className="text-[20px] font-semibold transition-colors hover:text-accent">
                        {a.frontmatter.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          ) : null}

          <div className="sheet mt-16">
            <div className="lg:col-span-7 lg:col-start-4">
              <Link to={localePath(lang, "/articles")} className="link font-semibold">
                {t.articles.back}
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
