import { createContext, useContext } from 'react';
import type { NexTheme } from './nexContent';
import { themeVariables } from './nexThemePreview';
export type Preview = { theme: NexTheme; dark: boolean } | null;
export const NexAppearanceContext = createContext<{ preview: Preview; setPreview: (preview: Preview) => void }>({ preview: null, setPreview: () => {} });
export function useNexAppearance() {
  const value = useContext(NexAppearanceContext);
  return { ...value, style: value.preview ? themeVariables(value.preview.theme, value.preview.dark) : undefined };
}
