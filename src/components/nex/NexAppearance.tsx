import { useState, type ReactNode } from 'react';
import { NexAppearanceContext, useNexAppearance, type Preview } from '../../lib/nexAppearance';
import { NEX_COPY } from '../../lib/nex';
import { useApp } from '../../lib/app';
export function NexAppearanceProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<Preview>(null);
  return <NexAppearanceContext.Provider value={{ preview, setPreview }}>{children}</NexAppearanceContext.Provider>;
}
export function NexAppearanceNotice() {
  const { preview, setPreview } = useNexAppearance();
  const { lang } = useApp(); const c = NEX_COPY[lang];
  if (!preview) return null;
  return <div className="nex-appearance-notice"><span>{c.themeLive}: {preview.theme.name[lang]}</span><button type="button" onClick={() => setPreview(null)}>{c.themeReset}</button></div>;
}
