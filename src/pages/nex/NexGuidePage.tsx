import { useEffect, useRef, useState } from 'react';
import { BookOpen, ArrowUpRight, X, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';
import { NEX_COPY } from '../../lib/nex';
import { normalizeNexDemo } from '../../lib/nexExperience';
import { localeNumber, nodeText, type GuideSection } from '../../lib/nexContent';
import NexPageFrame from '../../components/nex/NexPageFrame';
import { ContentBlocks } from '../../components/nex/ContentBlocks';
import fa from '../../../content/nex/guide.fa.json';
import en from '../../../content/nex/guide.en.json';
import product from '../../../content/nex/product.json';
export default function NexGuidePage() {
  const { lang } = useApp(); const c = NEX_COPY[lang]; const { hash } = useLocation();
  const data = lang === 'fa' ? fa : en;
  const [query, setQuery] = useState(''); const [active, setActive] = useState('guide-01'); const [tocOpen, setTocOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useBodyScrollLock(tocOpen);
  const sections = (data.sections as GuideSection[]).filter((section) => normalizeNexDemo(`${section.title} ${section.text}`).includes(normalizeNexDemo(query)));
  const current = sections.find((section) => section.id === active) ?? sections[0];
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const intersections = new Map<Element, IntersectionObserverEntry>();
    const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => intersections.set(entry.target, entry)); const visible = [...intersections.values()].filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio); if (visible[0]) setActive(visible[0].target.id); }, { rootMargin: '-10% 0px -55% 0px', threshold: [0, .1, .5] });
    document.querySelectorAll('[data-guide-chapter]').forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [query, lang]);
  useEffect(() => { if (/^#guide-\d{2}$/.test(hash)) document.getElementById(hash.slice(1))?.scrollIntoView?.({ block: 'start' }); }, [hash]);
  const contents = <nav aria-label={c.guideContents}>{sections.map((section) => <a key={section.id} href={`#${section.id}`} aria-current={active === section.id ? 'location' : undefined} onClick={() => { dialog.current?.close?.(); setTocOpen(false); }}>{section.title}</a>)}</nav>;
  return <NexPageFrame page={2}><div className="nex-guide-toolbar"><label className="nex-input-wrap"><Search size={18} aria-hidden="true" /><span className="nex-sr-only">{c.guideSearch}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={c.guideSearch} /></label><button className="nex-guide-open" type="button" onClick={() => { dialog.current?.showModal?.(); setTocOpen(true); }}><BookOpen size={18} aria-hidden="true" />{c.guideContents}</button></div>
    <dialog ref={dialog} className="nex-toc-sheet" aria-label={c.guideContents} onClose={() => setTocOpen(false)} onCancel={() => setTocOpen(false)}><button type="button" className="nex-toc-close" aria-label={c.guideClose} onClick={() => { dialog.current?.close?.(); setTocOpen(false); }}><X size={20} aria-hidden="true" /></button><h2>{c.guideContents}</h2>{contents}</dialog>
    <div className="nex-guide-layout"><aside className="nex-guide-desktop-toc"><p className="nex-demo-kicker">{c.guideContents}</p>{contents}</aside><div className="nex-guide-body nex-content"><p className="nex-guide-version">{c.guideSnapshot} <bdi>{product.version}</bdi></p>{!query && <ContentBlocks nodes={data.intro} lang={lang} />}{sections.map((section) => <section key={section.id} id={section.id} data-guide-chapter><p className="nex-chapter-number">{c.guideChapter} {localeNumber(Number(section.id.slice(-2)), lang)}</p><h2 tabIndex={-1}>{section.title}</h2><ContentBlocks nodes={section.blocks} lang={lang} /><a className="nex-guide-report" href={`https://github.com/sanyzrn/DbsNex/issues/new?title=${encodeURIComponent(`Guide (${lang}): ${section.title}`)}`}>{c.guideReport}<ArrowUpRight size={13} aria-hidden="true" /></a></section>)}{!sections.length && <p className="nex-empty-state" role="status">{c.noResults}</p>}</div><aside className="nex-guide-margin">{current && <div><span className="nex-guide-margin-number" aria-hidden="true">{localeNumber(Number(current.id.slice(-2)), lang)}</span><p className="nex-demo-kicker">{c.guideRead}</p><h2>{current.title}</h2><p>{nodeText(current.blocks.filter((node) => node.type === 'paragraph').slice(0,1)).slice(0, 240)}</p><BookOpen size={30} strokeWidth={1} aria-hidden="true" /></div>}</aside></div>
  </NexPageFrame>;
}
