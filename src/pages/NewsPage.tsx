import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { DirArrow, Reveal } from "../components/ui";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";

/**
 * Lightweight Daily Digest placeholder — reachable from the Field Notes landing
 * (`/articles`), not as a second top-level nav item.
 */
export default function NewsPage() {
  const { t, lang } = useApp();
  const copy = t.news;

  return (
    <>
      <PageMeta page="news" />
      <section className="section-pad border-t border-line bg-surface">
        <div className="wrap max-w-3xl">
          <Reveal>
            <Link
              to={localePath(lang, "/articles")}
              className="inline-flex items-center gap-2 text-[13px] font-bold text-ink2 transition-colors hover:text-hi"
            >
              <DirArrow className="h-4 w-4 rotate-180" />
              {copy.back}
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-8 text-[12px] font-bold uppercase tracking-[0.18em] text-ink3">{copy.kicker}</p>
            <h1 className="mt-3 text-[32px] font-extrabold tracking-tight text-ink md:text-[40px]">{copy.title}</h1>
            <p className="mt-4 max-w-xl text-[16px] font-medium leading-8 text-ink2 md:text-[17px]">{copy.lead}</p>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-8 max-w-xl text-[15px] leading-8 text-ink2">{copy.body}</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
