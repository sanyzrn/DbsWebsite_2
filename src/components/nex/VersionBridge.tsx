import { useState } from 'react';
import { ArrowDown, Check, GitCompareArrows } from 'lucide-react';
import { NEX_COPY } from '../../lib/nex';
import type { Lang } from '../../lib/i18n';
import { changeCount, localeNumber, nodeText, type HistoryRelease } from '../../lib/nexContent';
export default function VersionBridge({ releases, lang, onVersion }: { releases: HistoryRelease[]; lang: Lang; onVersion: (version: string) => void }) {
  const c = NEX_COPY[lang]; const [selected, setSelected] = useState(releases[1]?.version ?? releases[0].version);
  const index = releases.findIndex((entry) => entry.version === selected);
  const updates = index > 0 ? releases.slice(0, index) : [];
  const count = updates.reduce((sum, entry) => sum + changeCount(entry.notes[lang] ?? entry.notes.en), 0);
  return <section className="nex-version-bridge" aria-labelledby="nex-bridge-title"><div className="nex-bridge-heading"><GitCompareArrows size={25} strokeWidth={1.4} aria-hidden="true" /><div><h2 id="nex-bridge-title">{c.compareTitle}</h2><p>{c.compareLead}</p></div></div><label className="nex-bridge-select">{c.compareSelect}<select value={selected} onChange={(event) => setSelected(event.target.value)}>{releases.map((entry) => <option key={entry.version} value={entry.version}>v{entry.version}</option>)}</select></label><div className="nex-bridge-rail" aria-hidden="true"><span>v{selected}</span><i /><ArrowDown size={18} /><i /><strong>v{releases[0].version}</strong></div><p className="nex-bridge-count" role="status">{updates.length ? `${localeNumber(updates.length,lang)} ${c.compareVersions} · ${localeNumber(count,lang)} ${c.compareChanges}` : c.compareCurrent}</p>
    {updates.length ? <details className="nex-bridge-results" open><summary>{c.compareRead}</summary><ol>{[...updates].reverse().map((entry) => <li key={entry.version}><button type="button" aria-label={`${c.compareOpen} v${entry.version}`} onClick={() => onVersion(entry.version)}><bdi>v{entry.version}</bdi></button><p lang={lang === 'fa' && !entry.notes.fa ? 'en' : lang} dir={lang === 'fa' && !entry.notes.fa ? 'ltr' : undefined}>{nodeText(entry.notes[lang] ?? entry.notes.en).slice(0, 200)}…</p></li>)}</ol></details> : <p className="nex-bridge-current"><Check size={20} aria-hidden="true" />{c.compareOlder}</p>}
  </section>;
}
