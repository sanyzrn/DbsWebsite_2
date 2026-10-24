import { useNexAppearance } from "../../lib/nexAppearance";
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useApp } from '../../lib/app';
import { NEX_COPY } from '../../lib/nex';
import { nexPath } from '../../lib/nexContent';
import { PageMeta } from '../PageMeta';
import NexWordmark from './NexWordmark';
import NexNavigation from './NexNavigation';
import { NexAppearanceNotice } from './NexAppearance';
import '../../pages/nex-landing.css';
import './nex-experiences.css';
import './nex-product.css';
export default function NexPageFrame({ page, children }: { page: number; children: ReactNode }) {
  const { lang, dir, toggleTheme } = useApp(); const c = NEX_COPY[lang]; const { style } = useNexAppearance();
  const [ready, setReady] = useState(false);
  const slug = ['', 'features', 'guide', 'changelog', 'download', 'themes', 'faq', 'privacy'][page];
  useEffect(() => { const root = document.documentElement; const sync = () => { root.dataset.nexTheme = root.classList.contains('dark') ? 'dark' : 'light'; }; sync(); setReady(true); const observer = new MutationObserver(sync); observer.observe(root, { attributes: true, attributeFilter: ['class'] }); return () => { observer.disconnect(); delete root.dataset.nexTheme; }; }, []);
  return <><PageMeta page="nex" slug={slug} /><div className="nex-page nex-product-page" dir={dir} lang={lang} data-enhanced={ready} style={style}><div className="nex-shell">
    <header className="nex-masthead"><Link className="nex-brand" to={nexPath(lang)} aria-label={c.productHome}><NexWordmark className="nex-wordmark" /></Link><span className="nex-masthead-line">AI Second Memory</span><div className="nex-tools"><Link to={nexPath(lang === 'fa' ? 'en' : 'fa', slug)} lang={lang === 'fa' ? 'en' : 'fa'} aria-label={c.languageLabel}>{c.language}</Link><button className="nex-theme" type="button" onClick={toggleTheme} aria-label={c.themeLabel}><Moon className="nex-theme-moon" size={17} aria-hidden="true" /><Sun className="nex-theme-sun" size={17} aria-hidden="true" /></button></div></header>
    <NexNavigation lang={lang} /><NexAppearanceNotice />
    <header className="nex-product-heading"><p className="nex-demo-kicker">NEX / {c.productPages[page]}</p><h1>{c.productTitles[page]}</h1><p>{c.productDescriptions[page]}</p></header>
    {children}
    <footer className="nex-product-footer"><Link to="/">{c.productMadeBy}</Link><div><Link to={nexPath(lang, 'faq')}>{c.productPages[6]}</Link><Link to={nexPath(lang, 'privacy')}>{c.productPrivacy}</Link><a href="https://github.com/sanyzrn/DbsNex/blob/main/LICENSE">{c.productLicense}</a><a href="https://github.com/sanyzrn/DbsNex">{c.productSource}</a></div></footer>
  </div></div></>;
}
