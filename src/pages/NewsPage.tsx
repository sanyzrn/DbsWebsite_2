import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { SectionHead } from "../components/ui";
import { useApp } from "../lib/app";
import { formatArticleDate } from "../lib/formatDate";
import { getLocalizedNewsItems, type LocalizedNewsItem } from "../lib/news";
import { localePath } from "../lib/paths";

/** Calm, Concept-adjacent label — honest, not alarmist. */
function AiCuratedBadge() {
  const { t } = useApp();
  return (
    <span className="shrink-0 rounded-full border border-dashed border-ink3 px-2.5 py-0.5 text-[12px] font-semibold text-ink2">
      {t.news.curatedByAI}
    </span>
  );
}

function NewsItemRow({ item }: { item: LocalizedNewsItem }) {
  const { t, lang } = useApp();

  return (
    <li>
      <article className="border-b border-line py-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="meta tnum">
            {formatArticleDate(item.date, lang)}
          </p>
          {item.curatedByAI ? <AiCuratedBadge /> : null}
        </div>
        <h2 className="display mt-3 text-[1.75rem] leading-[1.05]">{item.title}</h2>
        <p className="mt-3 max-w-[62ch] text-[16px] text-ink2">{item.summary}</p>
        <p className="mt-4 text-[14px] font-semibold text-ink2">
          {t.news.sourceLabel}{" "}
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link text-ink"
          >
            {item.sourceName}
          </a>
        </p>
        {item.tags.length > 0 ? (
          <p className="meta mt-3">
            {item.tags.join(", ")}
          </p>
        ) : null}
      </article>
    </li>
  );
}

/**
 * Daily Digest list — short curated pointers to external sources.
 * No per-item detail routes; empty folder → honest empty state.
 */
export default function NewsPage() {
  const { t, lang } = useApp();
  const copy = t.news;
  const items = getLocalizedNewsItems(lang);

  return (
    <>
      <PageMeta page="news" />
      <section className="pb-[clamp(72px,9vw,160px)] pt-10 md:pt-16">
        <div className="wrap">
          <Link to={localePath(lang, "/articles")} className="link text-[14px] font-semibold text-ink2">
            {copy.back}
          </Link>

          <div className="mt-10">
            <SectionHead as="h1" size="page" kicker={copy.kicker} title={copy.title} lead={copy.lead} />
          </div>

          <div className="sheet mt-14 md:mt-20">
            <div className="lg:col-span-9 lg:col-start-4">
              {items.length === 0 ? (
                <div className="border-t border-rule pt-8">
                  <p className="lead max-w-xl">{copy.empty}</p>
                  <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                    <Link to={localePath(lang, "/contact")} className="btn btn-primary">
                      {copy.emptyCtaContact}
                    </Link>
                    <Link to={localePath(lang, "/articles")} className="link font-semibold">
                      {copy.emptyCtaArticles}
                    </Link>
                  </div>
                </div>
              ) : (
                <ol className="border-t border-rule">
                  {items.map((item) => (
                    <NewsItemRow key={item.id} item={item} />
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
