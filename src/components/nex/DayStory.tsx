import { useEffect, useRef, useState } from "react";
import { ArrowDown, ChevronLeft, ChevronRight, Check, FileText, LockKeyhole, Plus, Repeat2, Search } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import { NEX_COPY } from "../../lib/nex";
import { usePrefersReducedMotion } from "../../lib/motion";
import NexWordmark from "./NexWordmark";
import product from "../../../content/nex/product.json";

const screenNames = ["home", "search", "recurring", "vault-cards"];
function StoryScreen({ lang, active }: { lang: Lang; active: number }) {
  const c = NEX_COPY[lang];
  const name = `${screenNames[active]}${lang === "fa" ? "_fa" : ""}.webp`;
  const screenshot = product.images.find((image) => image.name === name && image.verified && image.src);
  if (screenshot?.src) return <figure className="nex-story-real"><img src={screenshot.src} width={screenshot.width} height={screenshot.height} draggable={false} loading="lazy" alt={c.storyScreens[active]} /></figure>;
  return <figure className="nex-story-illustration">
    <div className="nex-story-phone" aria-hidden="true">
      <div className="nex-story-phone-top"><span>{c.storyTimes[active]}</span><NexWordmark /></div>
      <div className="nex-story-screen" key={active} data-screen={active}>
        <span className="nex-screen-eyebrow">{c.storyScreens[active]}</span>
        {active === 0 && <><h4>{c.intro}</h4><div className="nex-story-note"><FileText size={19} /><p>{c.storySample}</p><small>{c.storyTimes[0]}</small></div><div className="nex-story-voice"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="nex-story-add"><Plus size={28} /></div></>}
        {active === 1 && <><div className="nex-story-search"><Search size={19} /><span>{c.storyQuery}</span></div><div className="nex-story-note"><Check size={19} /><p><mark>{c.storySample}</mark></p><small>{c.storyTimes[0]}</small></div><div className="nex-story-note nex-story-note--quiet"><FileText size={19} /><p>{c.storyText[1]}</p></div></>}
        {active === 2 && <><div className="nex-story-calendar"><Repeat2 size={24} /><strong>{lang === "fa" ? "۲۱" : "21"}</strong><span>{c.calendarPersian}</span></div><div className="nex-story-note"><Repeat2 size={19} /><p>{c.reminderTitle}</p><small>{c.calendarDay}</small></div><div className="nex-story-dots">{Array.from({ length: 14 }, (_, i) => <i key={i} />)}</div></>}
        {active === 3 && <><div className="nex-story-lock"><LockKeyhole size={66} strokeWidth={1} /></div><h4>{c.privateTitle}</h4><div className="nex-story-secrets"><span /><span /><span /></div><p className="nex-story-unlock">{c.storyPrivate}</p></>}
      </div>
      <div className="nex-story-phone-bottom"><span /></div>
    </div>
  </figure>;
}

export default function DayStory({ lang }: { lang: Lang }) {
  const c = NEX_COPY[lang];
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scroll: number } | null>(null);
  const frame = useRef(0);
  const reduced = usePrefersReducedMotion();
  useEffect(() => { setReady(true); return () => cancelAnimationFrame(frame.current); }, []);
  function choose(index: number) {
    const element = track.current;
    if (!element) return;
    setActive(index);
    element.scrollTo?.({ left: (lang === "fa" ? -1 : 1) * index * element.clientWidth, behavior: reduced ? "auto" : "smooth" });
  }
  function sync() {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const element = track.current;
      if (element?.clientWidth) setActive(Math.max(0, Math.min(3, Math.round(Math.abs(element.scrollLeft) / element.clientWidth))));
    });
  }
  return <section className="nex-day-story nex-story-carousel" id="nex-story" aria-labelledby="nex-story-title" data-active={active}>
    <div className="nex-story-heading"><p className="nex-demo-kicker">{c.storyEyebrow}</p><h2 id="nex-story-title">{c.storyTitle}</h2><p>{c.storyLead}</p></div>
    <figure className="nex-story-gallery"><div className="nex-story-track" ref={track} role="region" aria-roledescription="carousel" aria-label={c.navStory} tabIndex={0} onScroll={sync}
      onKeyDown={(event) => { if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return; event.preventDefault(); const delta = (event.key === "ArrowRight" ? 1 : -1) * (lang === "fa" ? -1 : 1); choose(event.key === "Home" ? 0 : event.key === "End" ? 3 : Math.max(0, Math.min(3, active + delta))); }}
      onPointerDown={(event) => { if (event.pointerType !== "mouse" || event.button !== 0 || (event.target as HTMLElement).closest("a,button")) return; drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft }; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={(event) => { if (!drag.current) return; if (Math.abs(event.clientX - drag.current.x) > 5) { event.preventDefault(); event.currentTarget.dataset.dragging = "true"; event.currentTarget.scrollLeft = drag.current.scroll - (event.clientX - drag.current.x); } }}
      onPointerUp={(event) => { if (!drag.current) return; const movement = event.clientX - drag.current.x; const width = event.currentTarget.clientWidth || 1; const start = Math.round(Math.abs(drag.current.scroll) / width); drag.current = null; delete event.currentTarget.dataset.dragging; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); choose(Math.max(0, Math.min(3, Math.abs(movement) > Math.min(80, width * .12) ? start + Math.sign(movement) * (lang === "fa" ? 1 : -1) : start))); }}
      onPointerCancel={(event) => { drag.current = null; delete event.currentTarget.dataset.dragging; }}>
      {c.storyTitles.map((title, i) => <div className="nex-story-slide" key={title} role="group" aria-roledescription="slide" aria-label={`${c.storyPosition} ${i + 1}`} aria-hidden={ready && active !== i} inert={ready && active !== i}>
        <StoryScreen lang={lang} active={i} /><article className="nex-story-step" data-step={i} data-current={active === i}><span className="nex-story-time" dir="ltr">{c.storyTimes[i]}</span><h3>{title}</h3><p>{c.storyText[i]}</p><a href={["#nex-today", "#nex-search-demo", "#nex-calendar", "#nex-privacy"][i]}>{[c.navCapture, c.navSearch, c.navReminder, c.navPrivacy][i]}<ArrowDown size={14} aria-hidden="true" /></a></article>
      </div>)}
    </div>
    <figcaption className="nex-story-preview-label">{c.screenshotPreview}</figcaption></figure>
    <div className="nex-story-bottom"><button className="nex-carousel-arrow" type="button" disabled={!ready || active === 0} onClick={() => choose(active - 1)} aria-label={c.storyPrevious}><ChevronLeft size={20} aria-hidden="true" /></button><div className="nex-story-controls" role="group" aria-label={c.navStory}>{c.storyTimes.map((time, i) => <button key={time} type="button" disabled={!ready} aria-pressed={active === i} aria-label={`${time} — ${c.storyScreens[i]}`} onClick={() => choose(i)}><span aria-hidden="true" /></button>)}</div><button className="nex-carousel-arrow" type="button" disabled={!ready || active === 3} onClick={() => choose(active + 1)} aria-label={c.storyNext}><ChevronRight size={20} aria-hidden="true" /></button></div><p className="nex-fine-print nex-story-gesture">{c.storyDrag}</p>
  </section>;
}
