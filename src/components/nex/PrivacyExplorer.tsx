import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, Check, Cloud, FolderOpen, HardDrive, LockKeyhole, Smartphone } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import { NEX_COPY } from "../../lib/nex";

const icons = [HardDrive, Smartphone, Cloud, FolderOpen, LockKeyhole];
export default function PrivacyExplorer({ lang }: { lang: Lang }) {
  const c = NEX_COPY[lang];
  const [selected, setSelected] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const Icon = icons[selected];
  return <section className="nex-privacy-explorer" id="nex-privacy" aria-labelledby="nex-privacy-title">
    <p className="nex-demo-kicker"><LockKeyhole size={16} aria-hidden="true" />{c.privacyEyebrow}</p>
    <h3 id="nex-privacy-title">{c.privacyTitle}</h3><p className="nex-demo-lead">{c.privacyLead}</p>
    <div className="nex-privacy-selector" role="group" aria-label={c.privacyEyebrow}>{c.privacyChoices.map((label, i) => <button key={label} type="button" disabled={!ready} aria-pressed={selected === i} onClick={() => setSelected(i)}>{label}</button>)}</div>
    <div className="nex-privacy-map" data-route={selected}>
      <div className="nex-data-journey" aria-hidden="true"><div className="nex-data-device"><Smartphone size={30} /><span>{c.privacyPhone}</span><small>{c.privacyData}</small></div><div className="nex-data-thread"><ArrowDown size={20} /></div><div className="nex-data-device"><Icon size={30} /><span>{c.privacyDestinations[selected]}</span><small>{c.privacyStates[selected]}</small></div></div>
      <div className="nex-privacy-explanation" aria-live="polite" aria-atomic="true"><span className="nex-privacy-state">{c.privacyStates[selected]}</span><h4>{c.privacyDestinations[selected]}</h4><p>{c.privacyDescriptions[selected]}</p></div>
    </div>
    <ul className="nex-privacy-checklist">{c.privacyChecklist.map((line) => <li key={line}><Check size={14} aria-hidden="true" />{line}</li>)}</ul>
    <details className="nex-network-disclosure"><summary>{c.privacyNetwork}</summary><p>{c.privacyNetworkText}</p></details>
    <a className="nex-release-source" href={`https://github.com/sanyzrn/DbsNex/blob/main/apps/client/assets/privacy/${lang}.md`}>{c.privacyPolicy}<ArrowUpRight size={14} aria-hidden="true" /></a>
    <p className="nex-demo-disclaimer">{c.privacyDemo}</p>
  </section>;
}
