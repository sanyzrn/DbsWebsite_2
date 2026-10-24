import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { NEX_COPY } from '../../lib/nex';
import { useNexReleases } from '../../lib/useNexReleases';
import { nexPath } from '../../lib/nexContent';
import type { NexRelease } from '../../../shared/nex-releases.mjs';
import NexPageFrame from '../../components/nex/NexPageFrame';
import ReleaseDownload from '../../components/nex/ReleaseDownload';
import data from '../../../content/nex/releases.json';
const saved = data.releases as NexRelease[];
export default function NexDownloadPage() {
  const { lang } = useApp(); const c = NEX_COPY[lang]; const fresh = useNexReleases();
  const releases = useMemo(() => { const all = new Map(saved.map((entry) => [entry.version,entry])); for (const entry of fresh) { const previous = all.get(entry.version); all.set(entry.version, { ...entry, notes: previous?.notes ?? entry.notes, assets: entry.assets.length ? entry.assets : previous?.assets ?? [] }); } return [...all.values()].sort((a,b) => { const x=a.version.split('.').map(Number),y=b.version.split('.').map(Number); return y[0]-x[0] || y[1]-x[1] || y[2]-x[2]; }); }, [fresh]);
  return <NexPageFrame page={4}><ReleaseDownload releases={releases} lang={lang} /><div className="nex-download-related"><Link to={nexPath(lang,'changelog')}>{c.productPages[3]}</Link><Link to={nexPath(lang,'guide') + '#guide-19'}>{c.faqGuide}</Link></div></NexPageFrame>;
}
