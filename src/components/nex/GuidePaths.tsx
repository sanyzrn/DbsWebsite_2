import { ArrowDownRight, FileText, Search, Bell, LockKeyhole } from 'lucide-react';
import { NEX_COPY } from '../../lib/nex';
import type { Lang } from '../../lib/i18n';
import { localeNumber } from '../../lib/nexContent';
const paths = [[1,2,3], [3,4,6], [7,8,17], [10,16,15]];
const icons = [FileText, Search, Bell, LockKeyhole];
/** Native disclosures and anchors keep every short path useful before JavaScript. */
export default function GuidePaths({ lang }: { lang: Lang }) {
  const c=NEX_COPY[lang];
  return <section className="nex-guide-paths" aria-labelledby="nex-paths-title"><div><h2 id="nex-paths-title">{c.quickTitle}</h2><p>{c.quickLead}</p></div><div className="nex-path-grid">{paths.map((chapters,i) => { const Icon=icons[i]; return <details key={i} name="nex-short-path"><summary><Icon size={20} strokeWidth={1.4} aria-hidden="true" /><span>{c.quickChoices[i]}</span><ArrowDownRight size={17} aria-hidden="true" /></summary><ol>{chapters.map((chapter,j) => <li key={chapter}><a href={`#guide-${String(chapter).padStart(2,'0')}`}><span>{localeNumber(j+1,lang)}</span>{c.quickSteps[i*3+j]}</a></li>)}</ol></details>; })}</div></section>;
}
