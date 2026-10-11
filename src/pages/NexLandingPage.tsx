import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Check, Circle, FileText, Image, Link2, LockKeyhole, Mic, Moon, Pin, Plus, Repeat2, Sun } from "lucide-react";
import { PageMeta } from "../components/PageMeta";
import LocalNote from "../components/nex/LocalNote";
import NexMark from "../components/nex/NexMark";
import { useApp } from "../lib/app";
import { NEX_COPY, NEX_SCREENSHOT, NEX_STORES } from "../lib/nex";
import "./nex-landing.css";

const WAVE = [10, 17, 25, 13, 30, 39, 19, 29, 43, 32, 18, 10, 22, 34, 46, 29, 18, 32, 39, 25, 15, 9, 18, 29, 40, 27, 14, 22, 32, 43, 28, 16, 10, 20, 29, 37, 23, 14];

function Card({ children, label, icon, time, className = "" }: { children: ReactNode; label: string; icon: ReactNode; time?: string; className?: string }) {
  return <article className={`nex-card ${className}`}>
    <div className="nex-card-meta"><h3>{icon}{label}</h3>{time && <span dir="ltr">{time}</span>}</div>
    {children}
  </article>;
}

function Day({ id, title, aside, children }: { id: string; title: string; aside: string; children: ReactNode }) {
  return <section className="nex-day" aria-labelledby={id}>
    <div className="nex-day-heading"><h2 id={id}>{title}</h2><span>{aside}</span></div>
    <div className="nex-day-notes">{children}</div>
  </section>;
}

export default function NexLandingPage() {
  const { lang, dir, toggleTheme } = useApp();
  const c = NEX_COPY[lang];
  const fa = lang === "fa";

  useEffect(() => {
    const root = document.documentElement;
    function syncTheme() { root.dataset.nexTheme = root.classList.contains("dark") ? "dark" : "light"; }
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => { observer.disconnect(); delete root.dataset.nexTheme; };
  }, []);

  return <>
    <PageMeta page="nex" />
    <div className="nex-page" dir={dir} lang={lang}>
      <div className="nex-sheet">
        <div className="nex-masthead">
          <h1 className="nex-brand" aria-label={c.pageLabel}><NexMark className="nex-mark" /><span dir="ltr">nex<span className="nex-brand-dot">.</span></span></h1>
          <div className="nex-tools">
            <Link to={fa ? "/en/nex/" : "/nex/"} lang={fa ? "en" : "fa"} aria-label={c.languageLabel}>{c.language}</Link>
            <button className="nex-theme" type="button" onClick={toggleTheme} aria-label={c.themeLabel}><Moon className="nex-theme-moon" size={17} aria-hidden="true" /><Sun className="nex-theme-sun" size={17} aria-hidden="true" /></button>
          </div>
        </div>

        <article id="nex-download" className="nex-card nex-pinned" aria-labelledby="nex-download-title">
          <div className="nex-card-meta"><span className="nex-pin-label"><Pin size={14} aria-hidden="true" />{c.pinned}</span><span className="nex-android">{c.android}</span></div>
          <h2 id="nex-download-title">{c.downloadTitle}</h2>
          <p>{c.downloadText}</p>
          <div className="nex-store-links">
            <a href={NEX_STORES.bazaar.href} data-todo={NEX_STORES.bazaar.todo} aria-disabled={NEX_STORES.bazaar.href === "#"} aria-describedby="nex-store-pending" onClick={(event) => { if (NEX_STORES.bazaar.href === "#") event.preventDefault(); }}><ArrowDown size={15} aria-hidden="true" />{c.bazaar}</a>
            <a href={NEX_STORES.myket.href} data-todo={NEX_STORES.myket.todo} aria-disabled={NEX_STORES.myket.href === "#"} aria-describedby="nex-store-pending" onClick={(event) => { if (NEX_STORES.myket.href === "#") event.preventDefault(); }}><ArrowDown size={15} aria-hidden="true" />{c.myket}</a>
          </div>
          {(NEX_STORES.bazaar.href === "#" || NEX_STORES.myket.href === "#") && <p id="nex-store-pending" className="nex-fine-print">{c.storePending}</p>}
        </article>

        <div className="nex-timeline">
          <Day id="nex-today" title={c.today} aside={c.todayAside}>
            <Card label={c.textLabel} icon={<FileText size={15} aria-hidden="true" />} time={fa ? "۱۰:۴۲" : "10:42"} className="nex-text-note">
              <p className="nex-note-title">{c.intro}</p><p>{c.introText}</p>
            </Card>
            <Card label={c.voiceLabel} icon={<Mic size={15} aria-hidden="true" />} time={fa ? "۱۰:۳۸" : "10:38"} className="nex-voice-note">
              <div className="nex-wave" aria-hidden="true">{WAVE.map((height, i) => <i key={i} className={`nex-wave-${height}`} />)}</div>
              <details className="nex-transcript"><summary>{c.voiceCaption}<span className="nex-sr-only"> — {c.voiceTranscript}</span><Plus size={14} aria-hidden="true" /></summary><p>{c.voiceText}</p></details>
            </Card>
            <Card label={c.checklistLabel} icon={<Check size={15} aria-hidden="true" />} time={fa ? "۱۰:۳۱" : "10:31"}>
              <p className="nex-note-title nex-note-title--small">{c.checklistTitle}</p>
              <ul className="nex-checklist">{c.checklist.map((item, i) => <li key={item}>{i < 2 ? <Check className="nex-check-checked" size={15} aria-hidden="true" /> : <Circle size={15} aria-hidden="true" />}<span>{item}</span></li>)}</ul>
            </Card>
            <LocalNote lang={lang} />
            <Card label={c.photoLabel} icon={<Image size={15} aria-hidden="true" />} time={fa ? "۱۰:۱۹" : "10:19"} className="nex-photo-note">
              <p className="nex-note-title nex-note-title--small">{c.photoTitle}</p>
              {NEX_SCREENSHOT.ready ? <img className="nex-screenshot" src={NEX_SCREENSHOT.src} width={NEX_SCREENSHOT.width} height={NEX_SCREENSHOT.height} loading="lazy" alt={c.screenshotAlt} /> : <div className="nex-photo-placeholder" data-todo="TODO: timeline-fa.webp, 1080 × 1920">
                <div className="nex-placeholder-frame" aria-hidden="true"><span /><span /><span /><span /></div>
                <div><span className="nex-placeholder-label">{c.screenshot}</span><span className="nex-fine-print">{c.screenshotHint}</span></div>
              </div>}
            </Card>
            <Card label={c.linkLabel} icon={<Link2 size={15} aria-hidden="true" />} time={fa ? "۱۰:۰۸" : "10:08"} className="nex-search-note">
              <p className="nex-note-title nex-note-title--small">{c.searchTitle}</p><p>{c.searchText}</p><p className="nex-fine-print">{c.searchAside}</p><a className="nex-inline-link" href="#nex-yesterday">{c.privacyLink}<ArrowDown size={12} aria-hidden="true" /></a>
            </Card>
          </Day>

          <Day id="nex-yesterday" title={c.yesterday} aside={c.yesterdayAside}>
            <Card label={c.privateLabel} icon={<LockKeyhole size={15} aria-hidden="true" />}>
              <p className="nex-note-title nex-note-title--small">{c.privateTitle}</p><p>{c.privateText}</p><p className="nex-fine-print">{c.privateAside}</p>
            </Card>
            <Card label={c.reminderLabel} icon={<Repeat2 size={15} aria-hidden="true" />}>
              <p className="nex-note-title nex-note-title--small">{c.reminderTitle}</p><p>{c.reminderText}</p>
              <details className="nex-ai-note"><summary>{c.aiLabel}<Plus size={14} aria-hidden="true" /></summary><p>{c.aiText}</p></details>
            </Card>
          </Day>

          <Day id="nex-first-day" title={c.firstDay} aside={c.firstDayAside}>
            <article className="nex-card nex-origin"><NexMark className="nex-origin-mark" /><div><p className="nex-fine-print">{c.makerText}</p><h3>{c.tagline}</h3><a href={fa ? "/" : "/en"}>{c.maker}</a></div><a className="nex-back-to-pin" href="#nex-download" aria-label={c.backToPin}><ArrowUp size={18} aria-hidden="true" /></a></article>
          </Day>
        </div>
        <p className="nex-end-mark" aria-hidden="true">nex / DbsStudio</p>
      </div>
    </div>
  </>;
}
