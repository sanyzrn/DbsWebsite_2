import { useEffect, useRef, useState } from "react";
import { ArrowDownLeft, FileText, Search } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import { NEX_EXPERIENCE } from "../../lib/nexExperience";
import { NEX_COPY } from "../../lib/nex";
import { highlightRanges, NEX_DEMO_NOTES, searchDemoNotes } from "../../lib/nexDemoSearch";

function Highlight({ text, query }: { text: string; query: string }) {
  const ranges = highlightRanges(text, query);
  const pieces = ranges.map(([start, end], i) => {
    const before = text.slice(i > 0 ? ranges[i - 1][1] : 0, start);
    return <span key={i}>{before}<mark>{text.slice(start, end)}</mark></span>;
  });
  return <>{pieces}{text.slice(ranges.length ? ranges[ranges.length - 1][1] : 0)}</>;
}

export default function SearchExperiment({ lang }: { lang: Lang }) {
  const e = NEX_EXPERIENCE[lang];
  const c = NEX_COPY[lang];
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setReady(true), []);
  const results = searchDemoNotes(query, lang);
  const matched = Boolean(query.trim()) && results.length > 0;
  const number = (value: number, digits = 0) => new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
  function updateQuery(value: string) {
    const start = performance.now();
    searchDemoNotes(value, lang);
    setElapsed(performance.now() - start);
    setQuery(value);
  }

  return <div className="nex-search-experiment">
    <label htmlFor="nex-search-demo" className="nex-sr-only">{e.searchLabel}</label>
    <div className="nex-search-field"><Search size={18} aria-hidden="true" /><input ref={inputRef} id="nex-search-demo" type="search" value={query} onChange={(event) => updateQuery(event.target.value)} disabled={!ready} placeholder={e.searchPlaceholder} dir="auto" maxLength={100} /></div>
    <div className="nex-search-metrics"><span>{number(results.length)} {c.searchCount} {number(NEX_DEMO_NOTES.length)} {c.searchNotes}</span>{elapsed !== null && <span>{number(elapsed, 2)} {c.searchSpeed}</span>}</div>
    <div className="nex-search-result" data-match={matched} tabIndex={0} role="region" aria-label={c.searchNotes}>
      <ul>{results.map((note) => <li key={note.id}><FileText size={15} aria-hidden="true" /><div><span dir={lang === "fa" ? "rtl" : "ltr"} lang={lang}><Highlight text={note[lang]} query={query} /></span><small><Highlight text={note.tag[lang]} query={query} /></small></div></li>)}</ul>
    </div>
    <div className="nex-search-feedback">{query ? <p className="nex-search-status" role="status">{matched ? e.searchFound : e.searchEmpty}</p> : <button className="nex-search-example" type="button" disabled={!ready} onClick={() => {
      updateQuery(e.searchExample);
      inputRef.current?.focus({ preventScroll: true });
    }}>{lang === "fa" ? "امتحان کن:" : "Try:"} <bdi lang={lang}>{e.searchExample}</bdi><ArrowDownLeft size={13} aria-hidden="true" /></button>}</div>
    <p className="nex-fine-print">{e.searchDemo}</p>
  </div>;
}
