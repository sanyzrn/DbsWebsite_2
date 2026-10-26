import { useNexAppearance } from "../lib/nexAppearance";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowDownLeft, BookOpen, GitCompareArrows, Layers, Palette, ArrowUp, Check, Circle, FileText, Image, Link2, LockKeyhole, Mic, Moon, Plus, Repeat2, Sun } from "lucide-react";
import { PageMeta } from "../components/PageMeta";
import LocalNote from "../components/nex/LocalNote";
import NexIntro from "../components/nex/NexIntro";
import NexMark from "../components/nex/NexMark";
import NexWordmark from "../components/nex/NexWordmark";
import ThoughtStage from "../components/nex/ThoughtStage";
import SearchExperiment from "../components/nex/SearchExperiment";
import IntelligenceDemo from "../components/nex/IntelligenceDemo";
import ReleaseDownload, { ReleaseBadge } from "../components/nex/ReleaseDownload";
import TimelineThread from "../components/nex/TimelineThread";
import TimelinePreview from "../components/nex/TimelinePreview";
import NexNavigation from "../components/nex/NexNavigation";
import { NexAppearanceNotice } from "../components/nex/NexAppearance";
import { nexPath } from "../lib/nexContent";
import ScreenGallery from "../components/nex/ScreenGallery";
import NexHighlights from "../components/nex/NexHighlights";
import ReminderCalendar from "../components/nex/ReminderCalendar";
import PrivacyExplorer from "../components/nex/PrivacyExplorer";
import { useApp } from "../lib/app";
import { NEX_COPY } from "../lib/nex";
import { useNexReleases } from "../lib/useNexReleases";
import { NEX_EXPERIENCE } from "../lib/nexExperience";
import "./nex-landing.css";
import "../components/nex/nex-experiences.css";
import "../components/nex/nex-product.css";

const WAVE = [10, 17, 25, 13, 30, 39, 19, 29, 43, 32, 18, 10, 22, 34, 46, 29, 18, 32, 39, 25, 15, 9, 18, 29, 40, 27, 14, 22, 32, 43, 28, 16, 10, 20, 29, 37, 23, 14];

function Card({ children, label, icon, time, className = "" }: { children: ReactNode; label: string; icon: ReactNode; time?: string; className?: string }) {
  return <article className={`nex-card ${className}`}>
    <div className="nex-card-meta"><h3>{icon}{label}</h3>{time && <span dir="ltr">{time}</span>}</div>
    {children}
  </article>;
}

function Day({ id, title, aside, children }: { id: string; title: string; aside: string; children: ReactNode }) {
  return <section id={id} className="nex-day" aria-labelledby={`${id}-title`}>
    <div className="nex-day-heading"><h2 id={`${id}-title`}>{title}</h2><span>{aside}</span></div>
    {children}
  </section>;
}

function Lines({ text }: { text: string }) {
  return <>{text.split("\n").map((line) => <span key={line}>{line}</span>)}</>;
}

export default function NexLandingPage() {
  const { lang, dir, toggleTheme } = useApp();
  const { style } = useNexAppearance();
  const c = NEX_COPY[lang];
  const e = NEX_EXPERIENCE[lang];
  const fa = lang === "fa";
  const releases = useNexReleases();
  const [ready, setReady] = useState(false);
  const [activeDay, setActiveDay] = useState("nex-today");
  const [personalThought, setPersonalThought] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    function syncTheme() { root.dataset.nexTheme = root.classList.contains("dark") ? "dark" : "light"; }
    syncTheme();
    setReady(true);
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => { observer.disconnect(); delete root.dataset.nexTheme; };
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) setActiveDay(entry.target.id);
    }, { rootMargin: "-15% 0px -55% 0px", threshold: 0 });
    document.querySelectorAll(".nex-page .nex-day").forEach((day) => observer.observe(day));
    return () => observer.disconnect();
  }, []);

  return <>
    <PageMeta page="nex" />
    <div id="nex-top" className="nex-page" dir={dir} lang={lang} data-enhanced={ready} style={style}>
      <NexIntro tagline={c.tagline} />
      <div className="nex-reading-progress" aria-hidden="true" />
      <div className="nex-shell">
        <header className="nex-masthead">
          <a className="nex-brand" href="#nex-top" aria-label={c.pageLabel}><NexWordmark className="nex-wordmark" /></a>
          <span className="nex-masthead-line">{e.eyebrow}</span>
          <div className="nex-tools">
            <Link to={fa ? "/en/nex/" : "/nex/"} lang={fa ? "en" : "fa"} aria-label={c.languageLabel}>{c.language}</Link>
            <button className="nex-theme" type="button" onClick={toggleTheme} aria-label={c.themeLabel}><Moon className="nex-theme-moon" size={17} aria-hidden="true" /><Sun className="nex-theme-sun" size={17} aria-hidden="true" /></button>
          </div>
        </header>
        <NexNavigation lang={lang} /><NexAppearanceNotice />

        <section id="nex-world" className="nex-hero" aria-labelledby="nex-hero-title">
          <div className="nex-hero-copy">
            <p className="nex-eyebrow"><span aria-hidden="true" />{c.android}</p>
            <ReleaseBadge release={releases[0]} lang={lang} />
            <h1 id="nex-hero-title"><span>{e.heroLine1}</span><span className="nex-hero-accent">{e.heroLine2}</span></h1>
            <p className="nex-hero-description">{e.heroText}</p>
            <div className="nex-hero-actions"><a className="nex-enter" href="#nex-download"><span>{c.downloadNow}</span><ArrowDown size={20} aria-hidden="true" /></a><a className="nex-see-it" href="#nex-today"><span>{e.enter}</span><ArrowDownLeft size={20} aria-hidden="true" /></a></div>
            <p className="nex-hero-footnote">{e.heroFootnote}</p>
          </div>
          <ThoughtStage lang={lang} personalThought={personalThought} />
          <div className="nex-scroll-cue"><span>{e.scrollCue}</span><ArrowDown size={15} aria-hidden="true" /></div>
        </section>

        <ScreenGallery lang={lang} />
        <NexHighlights lang={lang} />

        <div className="nex-chronicle">
          <nav className="nex-day-nav" aria-label={e.dayNav}>
            {[["nex-today", c.today], ["nex-yesterday", c.yesterday], ["nex-first-day", c.firstDay]].map(([id, title]) => <a href={`#${id}`} key={id} aria-current={activeDay === id ? "location" : undefined}><span className="nex-nav-dot" aria-hidden="true" /><span>{title}</span></a>)}
          </nav>
          <div className="nex-timeline">
            <TimelineThread lang={lang} />
            <Day id="nex-today" title={c.today} aside={c.todayAside}>
              <div className="nex-chapter-intro"><h3><Lines text={e.todayHeadline} /></h3><p>{e.todayLead}</p></div>
              <div className="nex-day-notes">
                <Card label={c.textLabel} icon={<FileText size={16} aria-hidden="true" />} time={fa ? "۱۰:۴۲" : "10:42"} className="nex-text-note">
                  <p className="nex-note-title">{c.intro}</p><p>{c.introText}</p><div className="nex-note-stamp" aria-hidden="true">nex / capture</div>
                </Card>
                <Card label={c.voiceLabel} icon={<Mic size={16} aria-hidden="true" />} time={fa ? "۱۰:۳۸" : "10:38"} className="nex-voice-note">
                  <div className="nex-wave" aria-hidden="true">{WAVE.map((height, i) => <i key={i} className={`nex-wave-${height}`} />)}</div>
                  <div className="nex-transcript-slot"><details className="nex-transcript"><summary>{c.voiceCaption}<span className="nex-sr-only"> — {c.voiceTranscript}</span><Plus size={17} aria-hidden="true" /></summary><p>{c.voiceText}</p></details></div>
                </Card>
                <Card label={c.checklistLabel} icon={<Check size={16} aria-hidden="true" />} time={fa ? "۱۰:۳۱" : "10:31"} className="nex-checklist-note">
                  <p className="nex-note-title nex-note-title--small">{c.checklistTitle}</p>
                  <ul className="nex-checklist">{c.checklist.map((item, i) => <li key={item}>{i < 2 ? <Check className="nex-check-checked" size={17} aria-hidden="true" /> : <Circle size={17} aria-hidden="true" />}<span>{item}</span></li>)}</ul>
                </Card>
                <div className="nex-local-stage"><span className="nex-handwritten">{e.demoNoteHint}<ArrowDownLeft size={25} aria-hidden="true" /></span><LocalNote lang={lang} onCaptureChange={setPersonalThought} /></div>
                <Card label={c.photoLabel} icon={<Image size={16} aria-hidden="true" />} time={fa ? "۱۰:۱۹" : "10:19"} className="nex-photo-note">
                  <p className="nex-note-title nex-note-title--small">{c.photoTitle}</p>
                  <TimelinePreview lang={lang} />
                </Card>
                <Card label={c.linkLabel} icon={<Link2 size={16} aria-hidden="true" />} time={fa ? "۱۰:۰۸" : "10:08"} className="nex-search-note">
                  <p className="nex-note-title nex-note-title--small">{c.searchTitle}</p><p>{c.searchText}</p><SearchExperiment lang={lang} /><a className="nex-inline-link" href="#nex-yesterday">{c.privacyLink}<ArrowDown size={13} aria-hidden="true" /></a>
                </Card>
              </div>
            </Day>

            <Day id="nex-yesterday" title={c.yesterday} aside={c.yesterdayAside}>
              <div className="nex-privacy-world">
                <div className="nex-privacy-copy"><h3 className="nex-chapter-title"><Lines text={e.yesterdayHeadline} /></h3><p className="nex-privacy-description">{c.privateText}</p><p className="nex-fine-print">{c.privateAside}</p></div>
                <div className="nex-vault-slot"><details className="nex-vault"><summary><span className="nex-vault-illustration" aria-hidden="true"><span className="nex-vault-card nex-vault-card--back" /><span className="nex-vault-card nex-vault-card--middle" /><span className="nex-vault-door"><LockKeyhole size={44} strokeWidth={1.2} /><span>nex / private</span></span></span><span className="nex-vault-action">{e.vaultLabel}<Plus size={19} aria-hidden="true" /></span></summary><p>{e.vaultInside}</p></details></div>
              </div>
              <p className="nex-vault-caption">{e.vaultCaption}</p>
              <PrivacyExplorer lang={lang} />
              <div className="nex-yesterday-notes">
                <Card label={c.reminderLabel} icon={<Repeat2 size={16} aria-hidden="true" />} className="nex-reminder-note">
                  <p className="nex-note-title nex-note-title--small">{c.reminderTitle}</p><p>{c.reminderText}</p>
                  <ReminderCalendar lang={lang} />
                </Card>
                <Card label={c.aiLabel} icon={<Circle size={16} aria-hidden="true" />} className="nex-ai-note"><p>{c.aiText}</p><IntelligenceDemo lang={lang} /></Card>
              </div>
            </Day>

            <Day id="nex-first-day" title={c.firstDay} aside={c.firstDayAside}>
              <div className="nex-origin-world"><div className="nex-origin-art" aria-hidden="true"><NexWordmark className="nex-origin-word" /><NexMark className="nex-origin-mark" /></div><div className="nex-origin-copy"><h3 className="nex-chapter-title"><Lines text={e.firstDayHeadline} /></h3><p>{e.firstDayLead}</p><p className="nex-origin-tagline">{c.tagline}</p><a href={fa ? "/" : "/en"}>{c.maker}</a></div></div>
              <a className="nex-final-cta" href="#nex-download"><span>{c.downloadText}</span><ArrowDown size={20} aria-hidden="true" /></a>
            </Day>
          </div>
        </div>
        <section className="nex-explore"><h2>{c.exploreTitle}</h2><p>{c.exploreLead}</p><div className="nex-explore-grid">{[Layers, BookOpen, GitCompareArrows, Palette].map((Icon,i)=><Link key={i} to={nexPath(lang, ["features","guide","changelog","themes"][i])}><Icon size={25} strokeWidth={1.3} aria-hidden="true"/><span>{c.exploreActions[i]}</span></Link>)}</div></section>
        <ReleaseDownload releases={releases} lang={lang} />
        <footer className="nex-footer"><span className="nex-footer-brand" dir="ltr"><NexWordmark className="nex-footer-word" /> / DbsStudio</span><a href="#nex-top">{e.backToHero}<ArrowUp size={15} aria-hidden="true" /></a></footer>
      </div>
    </div>
  </>;
}
