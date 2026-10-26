import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import { localeNumber } from "../../lib/nexContent";
import { usePrefersReducedMotion } from "../../lib/motion";
import { NEX_SCREENS, NEX_SCREENS_COPY } from "../../lib/nexScreens";

type Filter = "all" | Lang;
const SRC = "/images/nex/screens";

/**
 * The app's own screens in a native scroll-snap rail: swipe, drag the
 * scrollbar, use the arrows or the keyboard. Without JavaScript every screen
 * is still in the page and the rail still scrolls; only the filter and arrows
 * wait for it. The page's language comes first.
 */
export default function ScreenGallery({ lang }: { lang: Lang }) {
  const c = NEX_SCREENS_COPY[lang];
  const other: Lang = lang === "fa" ? "en" : "fa";
  const [filter, setFilter] = useState<Filter>("all");
  const [ready, setReady] = useState(false);
  const [edge, setEdge] = useState({ start: true, end: false });
  const track = useRef<HTMLUListElement>(null);
  const frame = useRef(0);
  const reduced = usePrefersReducedMotion();
  const shots = [...NEX_SCREENS.filter((s) => s.lang === lang), ...NEX_SCREENS.filter((s) => s.lang === other)].filter((s) => filter === "all" || s.lang === filter);

  function measure() {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = track.current;
      if (!el) return;
      const scrolled = Math.abs(el.scrollLeft);
      setEdge({ start: scrolled < 4, end: scrolled + el.clientWidth >= el.scrollWidth - 4 });
    });
  }
  useEffect(() => { setReady(true); measure(); return () => cancelAnimationFrame(frame.current); }, []);
  useEffect(() => { track.current?.scrollTo?.({ left: 0 }); measure(); }, [filter]);

  function step(forward: boolean) {
    const el = track.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    const width = card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "0");
    // In right-to-left the rail scrolls towards negative offsets.
    el.scrollBy?.({ left: (forward ? 1 : -1) * (lang === "fa" ? -1 : 1) * width, behavior: reduced ? "auto" : "smooth" });
  }

  return <section className="nex-screens" id="nex-screens" aria-labelledby="nex-screens-title">
    <div className="nex-screens-heading"><p className="nex-demo-kicker">{c.eyebrow}</p><h2 id="nex-screens-title">{c.title}</h2><p>{c.lead}</p></div>
    <div className="nex-screens-toolbar">
      <div className="nex-screens-filter" role="group" aria-label={c.filterLabel}>
        {(["all", lang, other] as Filter[]).map((value) => <button key={value} type="button" disabled={!ready} aria-pressed={filter === value} onClick={() => setFilter(value)} lang={value === "en" ? "en" : value === "fa" ? "fa" : undefined}>{c.filters[value]}</button>)}
      </div>
      <div className="nex-screens-arrows">
        <button className="nex-carousel-arrow" type="button" disabled={!ready || edge.start} onClick={() => step(false)} aria-label={c.previous}><ChevronLeft size={20} aria-hidden="true" /></button>
        <button className="nex-carousel-arrow" type="button" disabled={!ready || edge.end} onClick={() => step(true)} aria-label={c.next}><ChevronRight size={20} aria-hidden="true" /></button>
      </div>
    </div>
    <ul className="nex-screens-track" ref={track} tabIndex={0} aria-label={c.trackLabel} onScroll={measure}>
      {shots.map((shot, i) => <li key={shot.id} className="nex-screen" data-theme={shot.theme}>
        <figure>
          <div className="nex-screen-frame">
            <img src={`${SRC}/${shot.id}-540.webp`} srcSet={`${SRC}/${shot.id}-540.webp 540w, ${SRC}/${shot.id}-1080.webp 1080w`} sizes="(max-width: 820px) 72vw, 290px" width={1080} height={2400} loading="lazy" decoding="async" draggable={false} alt={shot.alt[lang]} />
          </div>
          <figcaption>
            <span className="nex-screen-meta"><span className="nex-screen-number">{localeNumber(i + 1, lang)}</span><span lang={shot.lang}>{c.filters[shot.lang]}</span><span>{c.themes[shot.theme]}</span></span>
            <h3>{shot.title[lang]}</h3>
            <p>{shot.text[lang]}</p>
          </figcaption>
        </figure>
      </li>)}
    </ul>
    <p className="nex-fine-print nex-screens-note">{c.note}</p>
  </section>;
}
