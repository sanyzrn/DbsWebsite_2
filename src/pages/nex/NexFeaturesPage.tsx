import { useState } from 'react';
import { Bell, FileText, LockKeyhole, Palette, Puzzle, Search, Sparkles, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { NEX_COPY } from '../../lib/nex';
import { normalizeNexDemo } from '../../lib/nexExperience';
import { localeNumber, nexPath } from '../../lib/nexContent';
import NexPageFrame from '../../components/nex/NexPageFrame';
import data from '../../../content/nex/features.json';
import product from '../../../content/nex/product.json';
const icons = [FileText, Search, Bell, Sparkles, LockKeyhole, Palette, Puzzle];
type Feature = { id: string; moduleId?: string; category: number; status: number; chapter: string; title: {fa:string;en:string}; description:{fa:string;en:string} };
export default function NexFeaturesPage() {
  const { lang } = useApp(); const c = NEX_COPY[lang];
  const [query, setQuery] = useState(''); const [category, setCategory] = useState(-1); const [status, setStatus] = useState(-1);
  const all = (data.features as Feature[]).map((feature) => ({ ...feature, status: feature.moduleId ? (product.availableModules.includes(feature.moduleId) ? 0 : 2) : feature.status }));
  const filtered = all.filter((feature) => (category < 0 || feature.category === category) && (status < 0 || feature.status === status) && normalizeNexDemo(`${feature.title[lang]} ${feature.description[lang]}`).includes(normalizeNexDemo(query)));
  return <NexPageFrame page={1}><div className="nex-filter-bar"><label className="nex-input-wrap"><Search size={18} aria-hidden="true" /><span className="nex-sr-only">{c.searchFeatures}</span><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.searchFeatures} /></label><label><span className="nex-sr-only">{c.allCategories}</span><select value={category} onChange={(e) => setCategory(Number(e.target.value))}><option value={-1}>{c.allCategories}</option>{c.featureCategories.map((text, i) => <option key={text} value={i}>{text}</option>)}</select></label><label><span className="nex-sr-only">{c.allStatuses}</span><select value={status} onChange={(e) => setStatus(Number(e.target.value))}><option value={-1}>{c.allStatuses}</option>{c.featureStatuses.map((text, i) => <option key={text} value={i}>{text}</option>)}</select></label></div>
    <div className="nex-results-line"><p role="status">{localeNumber(filtered.length, lang)} {c.featureCount}</p><button type="button" onClick={() => { setQuery(''); setCategory(-1); setStatus(-1); }}>{c.resetFilters}</button></div>
    <div className="nex-feature-grid">{filtered.map((feature) => { const Icon = icons[feature.category]; return <article className="nex-feature-card" key={feature.id} data-status={feature.status}><div className="nex-feature-top"><Icon size={24} strokeWidth={1.3} aria-hidden="true" /><span>{c.featureStatuses[feature.status]}</span></div><p className="nex-feature-category">{c.featureCategories[feature.category]}</p><h2>{feature.title[lang]}</h2><p>{feature.description[lang]}</p><Link to={`${nexPath(lang, 'guide')}#${feature.chapter}`}>{c.readGuide}<ArrowUpRight size={14} aria-hidden="true" /></Link></article>; })}</div>
    {!filtered.length && <p className="nex-empty-state">{c.noResults}</p>}
    <section className="nex-product-principles"><h2>{c.featureChoicesTitle}</h2><ul>{c.featureChoices.map((text) => <li key={text}>{text}</li>)}</ul><p className="nex-fine-print">{c.featureSource}</p></section>
  </NexPageFrame>;
}
