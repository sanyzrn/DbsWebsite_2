import { Link } from "react-router-dom";
import { ArchiveRestore, ArrowUpRight, Bell, CalendarClock, Droplet, FileText, Languages, Library, LockKeyhole, PenLine, Repeat2, Search, Sparkles, type LucideIcon } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import { nexPath } from "../../lib/nexContent";
import { NEX_HIGHLIGHTS, NEX_HIGHLIGHTS_COPY } from "../../lib/nexHighlights";

const icons: Record<string, LucideIcon> = { capture: PenLine, bell: Bell, repeat: Repeat2, letter: CalendarClock, library: Library, search: Search, ai: Sparkles, vault: LockKeyhole, cycle: Droplet, files: FileText, backup: ArchiveRestore, look: Languages };

/** The short list of what Nex does; every card is plain HTML, readable without JavaScript. */
export default function NexHighlights({ lang }: { lang: Lang }) {
  const c = NEX_HIGHLIGHTS_COPY[lang];
  return <section className="nex-highlights" aria-labelledby="nex-highlights-title">
    <div className="nex-highlights-heading"><p className="nex-demo-kicker">{c.eyebrow}</p><h2 id="nex-highlights-title">{c.title}</h2><p>{c.lead}</p></div>
    <ul className="nex-highlights-grid">
      {NEX_HIGHLIGHTS.map((item) => { const Icon = icons[item.icon]; return <li key={item.icon}><Icon size={22} strokeWidth={1.4} aria-hidden="true" /><h3>{item.title[lang]}</h3><p>{item.text[lang]}</p></li>; })}
    </ul>
    <Link className="nex-highlights-more" to={nexPath(lang, "features")}>{c.more}<ArrowUpRight size={15} aria-hidden="true" /></Link>
  </section>;
}
