import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, FileText, Moon, Sun } from 'lucide-react';
import { useApp } from '../../lib/app';
import { NEX_COPY } from '../../lib/nex';
import { nexPath, type NexTheme } from '../../lib/nexContent';
import NexPageFrame from '../../components/nex/NexPageFrame';
import { themeVariables } from '../../lib/nexThemePreview';
import { useNexAppearance } from '../../lib/nexAppearance';
import ThemeTexture from '../../components/nex/ThemeTexture';
import data from '../../../content/nex/themes.json';
export default function NexThemesPage() {
  const { lang } = useApp(); const c = NEX_COPY[lang]; const { preview, setPreview } = useNexAppearance();
  const [dark, setDark] = useState(false); const [overrides, setOverrides] = useState<Record<string,boolean>>({});
  return <NexPageFrame page={5}><div className="nex-theme-toolbar"><p>{c.themePalette}</p><div role="group" aria-label={c.themeMode}><button type="button" aria-pressed={!dark} onClick={() => { setDark(false); setOverrides({}); }}><Sun size={16} aria-hidden="true" />{c.themeLight}</button><button type="button" aria-pressed={dark} onClick={() => { setDark(true); setOverrides({}); }}><Moon size={16} aria-hidden="true" />{c.themeDark}</button></div></div>
    <div className="nex-themes-grid">{(data.themes as NexTheme[]).map((theme) => { const cardDark = overrides[theme.id] ?? dark; return <article key={theme.id} className="nex-theme-card"><div className="nex-theme-preview" data-texture={theme.texture} style={themeVariables(theme,cardDark)}><ThemeTexture id={`texture-${theme.id}-${cardDark ? 'dark' : 'light'}`} texture={theme.texture} /><div className="nex-theme-mini-note"><FileText size={17} aria-hidden="true" /><small>{c.themeTag}</small><p>{c.themeSample}</p><span aria-hidden="true">···</span></div><div className="nex-palette-dots" aria-hidden="true"><i /><i /><i /></div><button className="nex-theme-card-mode" type="button" aria-label={`${theme.name[lang]} — ${cardDark ? c.themeLight : c.themeDark}`} onClick={() => setOverrides({ ...overrides, [theme.id]: !cardDark })}>{cardDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}{cardDark ? c.themeLight : c.themeDark}</button></div><div className="nex-theme-card-copy"><h2>{theme.name[lang]}</h2><p>{theme.description[lang]}</p><button type="button" aria-pressed={preview?.theme.id === theme.id} onClick={() => setPreview({theme, dark:cardDark})}>{preview?.theme.id === theme.id ? c.themeSelected : c.themeTry}<ArrowUpRight size={15} aria-hidden="true" /></button></div></article>; })}</div><p className="nex-fine-print">{c.themePreview}</p><p className="nex-fine-print">{c.themeTryNote}</p>{preview && <Link className="nex-theme-return" to={nexPath(lang)}>{c.themeReturn}<ArrowUpRight size={16} aria-hidden="true" /></Link>}
  </NexPageFrame>;
}
