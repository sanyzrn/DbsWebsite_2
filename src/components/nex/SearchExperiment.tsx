import { useEffect, useState } from "react";
import { ArrowDownLeft, Check, Search } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import { NEX_EXPERIENCE, normalizeNexDemo } from "../../lib/nexExperience";

export default function SearchExperiment({ lang }: { lang: Lang }) {
  const e = NEX_EXPERIENCE[lang];
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const terms = query.trim().split(/[\s\u200c]+/).filter(Boolean);
  const matched = terms.length > 0 && terms.every((term) => normalizeNexDemo(e.searchSample).includes(normalizeNexDemo(term)));

  return <div className="nex-search-experiment">
    <label htmlFor="nex-search-demo" className="nex-sr-only">{e.searchLabel}</label>
    <div className="nex-search-field"><Search size={18} aria-hidden="true" /><input id="nex-search-demo" type="search" value={query} onChange={(event) => setQuery(event.target.value)} disabled={!ready} placeholder={e.searchPlaceholder} dir="auto" maxLength={100} /></div>
    <div className="nex-search-result" data-match={matched}>
      <span dir={lang === "fa" ? "rtl" : "ltr"} lang={lang}>{e.searchSample}</span>{matched ? <Check size={16} aria-hidden="true" /> : <ArrowDownLeft size={16} aria-hidden="true" />}
    </div>
    <div className="nex-search-feedback">{query ? <p className="nex-search-status" role="status">{matched ? e.searchFound : e.searchEmpty}</p> : <button className="nex-search-example" type="button" disabled={!ready} onClick={() => setQuery(e.searchExample)}>{lang === "fa" ? "امتحان کن:" : "Try:"} <bdi lang={lang}>{e.searchExample}</bdi><ArrowDownLeft size={13} aria-hidden="true" /></button>}</div>
    <p className="nex-fine-print">{e.searchDemo}</p>
  </div>;
}
