import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { DirArrow, Reveal, SectionHead, DecorativeGrid } from "../components/ui";
import { useApp } from "../lib/app";
import { formatArticleDate } from "../lib/formatDate";
import { getLocalizedNewsItems, type LocalizedNewsItem } from "../lib/news";
import { localePath } from "../lib/paths";

/** Calm, Concept-adjacent label — honest, not alarmist. */
function AiCuratedBadge() {
  const { t } = useApp();
  return (
    <span className="shrink-0 rounded-xs border border-dashed border-ink3/50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-ink3">
      {t.news.curatedByAI}
    </span>
  );
}

function NewsItemRow({ item, index }: { item: LocalizedNewsItem; index: number }) {
  const { t, lang } = useApp();

  return (
    <Reveal delay={Math.min(index * 80, 480)}>
      <article className="border-b border-line py-8 first:pt-0 last:border-b-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink3">
            {formatArticleDate(item.date, lang)}
          </p>
          {item.curatedByAI ? <AiCuratedBadge /> : null}
        </div>
        <h2 className="mt-3 text-[20px] font-extrabold tracking-tight md:text-[22px]">{item.title}</h2>
        <p className="mt-3 max-w-2xl text-[14.5px] leading-7 text-ink2">{item.summary}</p>
        <p className="mt-4 text-[13px] font-semibold text-ink2">
          {t.news.sourceLabel}{" "}
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-hi transition-colors hover:text-ink"
          >
            {item.sourceName}
          </a>
        </p>
        {item.tags.length > 0 ? (
          <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink3">
            {item.tags.join(" · ")}
          </p>
        ) : null}
      </article>
    </Reveal>
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
      <section className="relative overflow-hidden section-pad border-t border-line bg-surface">
        <DecorativeGrid />
        <div className="wrap relative max-w-3xl">
          <Reveal>
            <Link
              to={localePath(lang, "/articles")}
              className="inline-flex items-center gap-2 text-[13px] font-bold text-ink2 transition-colors hover:text-hi"
            >
              <DirArrow className="h-4 w-4 rotate-180" />
              {copy.back}
            </Link>
          </Reveal>

          <Reveal delay={60}>
            <div className="mt-8">
              <SectionHead kicker={copy.kicker} title={copy.title} lead={copy.lead} />
            </div>
          </Reveal>

          {items.length === 0 ? (
            <Reveal delay={120}>
              <p className="mt-10 max-w-xl text-[15px] leading-8 text-ink2">{copy.empty}</p>
            </Reveal>
          ) : (
            <div className="mt-10">
              {items.map((item, i) => (
                <NewsItemRow key={item.id} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
