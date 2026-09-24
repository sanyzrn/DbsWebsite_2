import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { SectionHead } from "../components/ui";
import { useApp } from "../lib/app";
import { getPublishedArticles, type Article } from "../lib/articles";
import { formatArticleDate } from "../lib/formatDate";
import { DAILY_DIGEST_ENABLED } from "../lib/news";
import { localePath } from "../lib/paths";

/** One entry in the contents list: date in the margin, title and standfirst beside it. */
function ArticleRow({ article }: { article: Article }) {
  const { t, lang } = useApp();
  const to = localePath(lang, `/articles/${article.slug}`);
  const { frontmatter: fm } = article;

  return (
    <li className="group relative border-b border-line">
      <article className="sheet py-8 md:py-10">
        <p className="meta tnum lg:col-span-3 lg:pt-2">
          <time dateTime={fm.date}>{formatArticleDate(fm.date, lang)}</time>
        </p>
        <div className="lg:col-span-7">
          <h2 className="display text-[1.875rem] leading-[1.02] md:text-[2.5rem]">
            <Link to={to} className="stretch transition-colors group-hover:text-accent">
              {fm.title}
            </Link>
          </h2>
          <p className="mt-4 max-w-[60ch] text-[16px] text-ink2">{fm.description}</p>
        </div>
        <p className="meta lg:col-span-2 lg:pt-2 lg:text-end">
          {t.articles.readingTime.replace("{n}", String(fm.readingTimeMinutes))}
        </p>
      </article>
    </li>
  );
}

/** Quiet secondary entry to Daily Digest — not a second top-level nav item. */
function DailyDigestTeaser() {
  const { t, lang } = useApp();

  return (
    <aside className="sheet mt-16 md:mt-24">
      <div className="border-t border-rule pt-8 lg:col-span-9 lg:col-start-4">
        <h2 className="text-[22px] font-semibold">{t.articles.digestTitle}</h2>
        <p className="mt-2 max-w-[56ch] text-ink2">{t.articles.digestLead}</p>
        <Link to={localePath(lang, "/news")} className="link mt-5 inline-block font-semibold">
          {t.articles.digestCta}
        </Link>
      </div>
    </aside>
  );
}

export default function ArticlesPage() {
  const { t, lang } = useApp();
  const articles = getPublishedArticles(lang);

  return (
    <>
      <PageMeta page="articles" />
      <section id="articles" className="pb-[clamp(72px,9vw,160px)] pt-10 md:pt-16">
        <div className="wrap">
          <SectionHead as="h1" size="page" kicker={t.articles.pageKicker} title={t.articles.pageTitle} lead={t.articles.pageLead} />

          {articles.length === 0 ? (
            <p className="lead mt-16 max-w-xl">{t.articles.empty}</p>
          ) : (
            <ol className="mt-16 border-t border-rule md:mt-24">
              {articles.map((article) => (
                <ArticleRow key={article.slug} article={article} />
              ))}
            </ol>
          )}

          {DAILY_DIGEST_ENABLED ? <DailyDigestTeaser /> : null}
        </div>
      </section>
    </>
  );
}
