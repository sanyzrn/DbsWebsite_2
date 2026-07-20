import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { DirArrow, Reveal, SectionHead } from "../components/ui";
import { useApp } from "../lib/app";
import { getPublishedArticles, type Article } from "../lib/articles";
import { formatArticleDate } from "../lib/formatDate";
import { localePath } from "../lib/paths";

function ArticleCard({ article, index }: { article: Article; index: number }) {
  const { t, lang } = useApp();
  const to = localePath(lang, `/articles/${article.slug}`);
  const { frontmatter: fm } = article;

  return (
    <Reveal delay={Math.min(index * 80, 480)} className="h-full">
      <article className="group flex h-full min-h-[280px] w-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-all duration-500 hover:-translate-y-1.5 hover:border-hi/60">
        <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink3">
            {formatArticleDate(fm.date, lang)}
            <span className="mx-2 text-line2">·</span>
            {t.articles.readingTime.replace("{n}", String(fm.readingTimeMinutes))}
          </p>
          <h2 className="line-clamp-2 text-[20px] font-extrabold tracking-tight">
            <Link to={to} className="transition-colors hover:text-hi">
              {fm.title}
            </Link>
          </h2>
          <p className="line-clamp-3 text-[13px] leading-7 text-ink2">{fm.description}</p>
          <div className="mt-auto border-t border-line pt-4">
            {fm.tags.length > 0 ? (
              <p className="mb-3 line-clamp-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink3">
                {fm.tags.join(" · ")}
              </p>
            ) : null}
            <Link to={to} className="inline-flex items-center gap-2 text-[12.5px] font-bold text-ink2 transition-colors hover:text-hi">
              {t.articles.view}
              <DirArrow className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/** Quiet secondary entry to Daily Digest — not a second top-level nav item. */
function DailyDigestTeaser() {
  const { t, lang } = useApp();

  return (
    <Reveal delay={120}>
      <aside className="mt-12 border-t border-line pt-10 md:mt-14 md:pt-12">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink3">
          {t.articles.digestKicker}
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="max-w-xl">
            <h2 className="text-[18px] font-extrabold tracking-tight md:text-[20px]">{t.articles.digestTitle}</h2>
            <p className="mt-2 text-[13.5px] leading-7 text-ink2">{t.articles.digestLead}</p>
          </div>
          <Link
            to={localePath(lang, "/news")}
            className="inline-flex shrink-0 items-center gap-2 text-[13px] font-bold text-hi transition-colors hover:text-ink"
          >
            {t.articles.digestCta}
            <DirArrow className="h-4 w-4" />
          </Link>
        </div>
      </aside>
    </Reveal>
  );
}

export default function ArticlesPage() {
  const { t, lang } = useApp();
  const articles = getPublishedArticles(lang);

  return (
    <>
      <PageMeta page="articles" />
      <section id="articles" className="section-pad border-t border-line">
        <div className="wrap">
          <SectionHead kicker={t.articles.pageKicker} title={t.articles.pageTitle} lead={t.articles.pageLead} />

          {articles.length === 0 ? (
            <Reveal delay={80}>
              <p className="mt-10 max-w-xl text-[15px] leading-8 text-ink2">{t.articles.empty}</p>
            </Reveal>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {articles.map((article, i) => (
                <ArticleCard key={article.slug} article={article} index={i} />
              ))}
            </div>
          )}

          <DailyDigestTeaser />
        </div>
      </section>
    </>
  );
}
