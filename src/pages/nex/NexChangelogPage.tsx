import { useEffect, useMemo, useState } from 'react';
import { Download, Link2, Rss, Search } from 'lucide-react';
import { useApp } from '../../lib/app';
import { NEX_COPY } from '../../lib/nex';
import { useNexReleases } from '../../lib/useNexReleases';
import { normalizeNexDemo } from '../../lib/nexExperience';
import { mergeReleaseHistory, nodeText, localeNumber, nexPath, publicReleaseDate, type HistoryRelease } from '../../lib/nexContent';
import { selectApk } from '../../../shared/nex-releases.mjs';
import NexPageFrame from '../../components/nex/NexPageFrame';
import { ContentBlocks } from '../../components/nex/ContentBlocks';
import VersionBridge from '../../components/nex/VersionBridge';
import history from '../../../content/nex/history.json';
const saved = history.releases as HistoryRelease[];
const PAGE_SIZE = 10;
export default function NexChangelogPage() {
  const { lang } = useApp(); const c = NEX_COPY[lang]; const fresh = useNexReleases();
  const releases = useMemo(() => mergeReleaseHistory(saved, fresh), [fresh]);
  const [query, setQuery] = useState(''); const [page, setPage] = useState(0); const [focus, setFocus] = useState({ version: '' });
  const filtered = releases.filter((entry) => normalizeNexDemo(`${entry.version} ${nodeText(entry.notes[lang] ?? entry.notes.en)}`).includes(normalizeNexDemo(query)));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)); const currentPage = Math.min(page, pages - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  function openVersion(version: string) { const index = releases.findIndex((entry) => entry.version === version); if (index < 0) return; setQuery(''); setPage(Math.floor(index / PAGE_SIZE)); setFocus({ version }); window.history.replaceState(null, '', `#v${version}`); }
  useEffect(() => {
    function restoreHash() { const version = window.location.hash.match(/^#v(\d+\.\d+\.\d+)$/)?.[1]; const index = releases.findIndex((entry) => entry.version === version); if (index >= 0) { setQuery(''); setPage(Math.floor(index / PAGE_SIZE)); setFocus({ version: version! }); } }
    restoreHash(); window.addEventListener('hashchange', restoreHash); return () => window.removeEventListener('hashchange', restoreHash);
  }, [releases]);
  useEffect(() => { const id = focus.version ? `v${focus.version}` : window.location.hash.slice(1); if (/^v\d+\.\d+\.\d+$/.test(id)) { const element = document.getElementById(id); if (element instanceof HTMLDetailsElement) { element.open = true; element.scrollIntoView?.({ block: 'start' }); } } }, [page, query, releases, focus]);
  return <NexPageFrame page={3}><VersionBridge releases={releases} lang={lang} onVersion={openVersion} /><div className="nex-history-toolbar"><label className="nex-input-wrap"><Search size={18} aria-hidden="true" /><span className="nex-sr-only">{c.historySearch}</span><input type="search" value={query} placeholder={c.historySearch} onChange={(event) => { setQuery(event.target.value); setPage(0); }} /></label><a href={`${nexPath(lang, 'changelog').replace(/\/changelog$/, '')}/changelog.xml`}><Rss size={15} aria-hidden="true" />{c.historyRSS}</a></div><div className="nex-results-line"><p role="status">{localeNumber(filtered.length, lang)} {c.historyCount}</p><label><span className="nex-sr-only">{c.historyAll}</span><select value="" onChange={(event) => openVersion(event.target.value)}><option value="" disabled>{c.historyAll}</option>{releases.map((entry) => <option key={entry.version} value={entry.version}>v{entry.version}</option>)}</select></label></div>
    <div className="nex-release-timeline">{visible.map((entry, i) => { const fallback = lang === 'fa' && !entry.notes.fa; const apk = selectApk(entry.assets); return <details key={entry.version} id={`v${entry.version}`} className="nex-history-entry" open={i === 0}><summary><span className="nex-history-dot" aria-hidden="true" /><strong dir="ltr">v{entry.version}</strong><time dateTime={entry.publishedAt}>{publicReleaseDate(entry.publishedAt, lang)}</time>{entry.version === releases[0].version && <span className="nex-latest-pill">{c.historyLatest}</span>}</summary><div className="nex-history-entry-body">{fallback && <p className="nex-history-fallback">{c.historyFallback}</p>}<div className="nex-content" lang={fallback ? 'en' : lang} dir={fallback ? 'ltr' : undefined}><ContentBlocks nodes={entry.notes[lang] ?? entry.notes.en} lang={lang} /></div><div className="nex-history-entry-links">{apk ? <a href={apk.url}><Download size={15} aria-hidden="true" />{c.historyDownload}</a> : <span>{c.historyNoApk}</span>}<a href={`#v${entry.version}`} aria-label={`${c.historyPermalink} v${entry.version}`}><Link2 size={15} aria-hidden="true" /><bdi>v{entry.version}</bdi></a><a href={entry.url}>{c.releasePage}</a></div></div></details>; })}</div>
    {!visible.length && <p className="nex-empty-state">{c.noResults}</p>}<nav className="nex-pagination" aria-label={c.historyPage}><button type="button" disabled={currentPage === 0} onClick={() => { setFocus({ version: '' }); window.history.replaceState(null, '', window.location.pathname); setPage(currentPage - 1); }}>{c.historyPrevious}</button><span>{localeNumber(currentPage + 1,lang)} / {localeNumber(pages,lang)}</span><button type="button" disabled={currentPage >= pages - 1} onClick={() => { setFocus({ version: '' }); window.history.replaceState(null, '', window.location.pathname); setPage(currentPage + 1); }}>{c.historyNext}</button></nav><a className="nex-source-link" href={`https://github.com/sanyzrn/DbsNex/blob/main/CHANGELOG${lang === 'fa' ? '.fa' : ''}.md`}>{c.historySource}</a><noscript><p>{c.historySource}: <a href="https://github.com/sanyzrn/DbsNex/blob/main/CHANGELOG.md">GitHub</a></p></noscript>
  </NexPageFrame>;
}
