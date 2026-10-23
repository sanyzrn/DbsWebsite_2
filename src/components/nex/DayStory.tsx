import { useEffect, useRef, useState } from "react";
import { ArrowDown, Check, FileText, LockKeyhole, Plus, Repeat2, Search } from "lucide-react";
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
  if (screenshot?.src) return <figure className="nex-story-real"><img src={screenshot.src} width={screenshot.width} height={screenshot.height} loading="lazy" alt={c.storyScreens[active]} /></figure>;
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
    </div><figcaption>{c.screenshotPreview}</figcaption>
  </figure>;
}

export default function DayStory({ lang }: { lang: Lang }) {
  const c = NEX_COPY[lang];
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => setReady(true), []);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced || typeof IntersectionObserver === "undefined") return;
    const wide = window.matchMedia("(min-width: 821px)");
    let observer: IntersectionObserver | null = null;
    function sync() {
      observer?.disconnect();
      if (!wide.matches) return;
      const intersections = new Map<Element, IntersectionObserverEntry>();
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => intersections.set(entry.target, entry));
        const visible = [...intersections.values()].filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(Number((visible[0].target as HTMLElement).dataset.step));
      }, { rootMargin: "-25% 0px -30% 0px", threshold: [0, 0.25, 0.5] });
      root!.querySelectorAll(".nex-story-step").forEach((step) => observer!.observe(step));
    }
    sync();
    wide.addEventListener("change", sync);
    return () => { observer?.disconnect(); wide.removeEventListener("change", sync); };
  }, [reduced]);
  return <section className="nex-day-story" id="nex-story" ref={rootRef} aria-labelledby="nex-story-title" data-active={active}>
    <div className="nex-story-heading"><p className="nex-demo-kicker">{c.storyEyebrow}</p><h2 id="nex-story-title">{c.storyTitle}</h2><p>{c.storyLead}</p></div>
    <div className="nex-story-layout">
      <div className="nex-story-visual"><div className="nex-story-sticky"><StoryScreen lang={lang} active={active} /><div className="nex-story-controls" role="group" aria-label={c.navStory}>{c.storyTimes.map((time, i) => <button key={time} type="button" disabled={!ready} aria-pressed={active === i} aria-label={`${time} — ${c.storyScreens[i]}`} onClick={() => setActive(i)}><span aria-hidden="true" /></button>)}</div><p className="nex-fine-print">{c.storyHint}</p></div></div>
      <div className="nex-story-chapters">{c.storyTitles.map((title, i) => <article className="nex-story-step" data-step={i} key={title} data-current={active === i}><span className="nex-story-time" dir="ltr">{c.storyTimes[i]}</span><h3>{title}</h3><p>{c.storyText[i]}</p><a href={["#nex-today", "#nex-search-demo", "#nex-calendar", "#nex-privacy"][i]}>{[c.navCapture, c.navSearch, c.navReminder, c.navPrivacy][i]}<ArrowDown size={14} aria-hidden="true" /></a></article>)}</div>
    </div>
  </section>;
}
