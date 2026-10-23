import { Check, FileText, Mic, Plus, Search } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import { NEX_COPY } from "../../lib/nex";
import { NEX_EXPERIENCE } from "../../lib/nexExperience";
import NexWordmark from "./NexWordmark";

/** Upstream guide pictures are placeholders. Never present them as app screenshots. */
export default function TimelinePreview({ lang }: { lang: Lang }) {
  const c = NEX_COPY[lang];
  const fa = lang === "fa";
  return <figure className="nex-timeline-preview">
    <div className="nex-preview-phone" role="img" aria-label={c.screenshotAlt}>
      <div aria-hidden="true">
        <header><NexWordmark /><span>{fa ? "۱۰:۴۲" : "10:42"}</span></header>
        <div className="nex-preview-search"><Search size={15} /><span>{c.searchTitle}</span></div>
        <div className="nex-preview-date">{c.today}</div>
        <div className="nex-preview-items">
          <div><FileText size={15} /><p>{NEX_EXPERIENCE[lang].sampleNote}<small>{fa ? "۱۰:۴۲" : "10:42"}</small></p></div>
          <div><Mic size={15} /><p><span className="nex-preview-wave">{Array.from({ length: 22 }, (_, i) => <i key={i} className={`nex-preview-bar-${i % 5}`} />)}</span><small>{c.voiceLabel}</small></p></div>
          <div><Check size={15} /><p>{c.checklist.slice(0, 2).map((line) => <span className="nex-preview-check" key={line}><Check size={12} />{line}</span>)}</p></div>
        </div>
        <div className="nex-preview-plus"><Plus size={22} /></div>
      </div>
    </div>
    <figcaption>{c.screenshotPreview}</figcaption>
  </figure>;
}
