import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDictionary, type Dict, type Lang } from "./i18n";
import { runThemeTransition } from "./motion";
import { ACCENT_STORAGE_KEY, DEFAULT_ACCENT, applyAccent, isAccentId, type AccentId } from "./accent";
import { langFromPath, localePath, stripLangPrefix } from "./paths";
import { readPreference, writePreference } from "./storage";

export type Theme = "light" | "dark";

export interface AppState {
  lang: Lang;
  dir: "rtl" | "ltr";
  isRTL: boolean;
  t: Dict;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  theme: Theme;
  toggleTheme: () => void;
  accent: AccentId;
  setAccent: (a: AccentId) => void;
}

/** Exported so tests can provide the context directly without module mocking. */
export const AppCtx = createContext<AppState | null>(null);

const subscribeToHydration = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;

function initialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = readPreference("sz-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function initialAccent(): AccentId {
  if (typeof window === "undefined") return DEFAULT_ACCENT;
  const stored = readPreference(ACCENT_STORAGE_KEY);
  return isAccentId(stored) ? stored : DEFAULT_ACCENT;
}

/** Preference memory only — never overrides URL locale by itself. */
export function readStoredLang(): Lang | null {
  if (typeof window === "undefined") return null;
  const stored = readPreference("sz-lang");
  return stored === "en" || stored === "fa" ? stored : null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  // Match the prerender's preference-dependent controls on the hydration pass.
  // The pre-paint script already applies the chosen CSS theme and accent.
  const hydrated = useSyncExternalStore(subscribeToHydration, clientHydrated, serverHydrated);
  const [lang, setLangState] = useState<Lang>(() => langFromPath(location.pathname));
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [accent, setAccentState] = useState<AccentId>(initialAccent);

  const dir: "rtl" | "ltr" = lang === "fa" ? "rtl" : "ltr";

  // URL is the source of truth for locale (/en… → en, otherwise fa).
  useEffect(() => {
    const fromUrl = langFromPath(location.pathname);
    setLangState(fromUrl);
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
  }, [lang, dir]);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    writePreference("sz-theme", theme);
  }, [theme, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    applyAccent(accent);
    writePreference(ACCENT_STORAGE_KEY, accent);
  }, [accent, hydrated]);

  const setAccent = useCallback((next: AccentId) => {
    runThemeTransition(() => {
      applyAccent(next);
      setAccentState(next);
    });
  }, []);

  const setLang = useCallback(
    (next: Lang) => {
      // Persist before navigate so a racey preference redirect cannot override
      // an explicit language choice with a stale sz-lang value.
      writePreference("sz-lang", next);
      const path = stripLangPrefix(location.pathname);
      navigate({
        pathname: localePath(next, path),
        search: location.search,
        hash: location.hash,
      });
    },
    [location.pathname, location.hash, location.search, navigate]
  );

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    runThemeTransition(() => {
      // Apply DOM tokens synchronously so View Transitions can capture old/new.
      const root = document.documentElement;
      root.classList.toggle("dark", next === "dark");
      writePreference("sz-theme", next);
      setTheme(next);
    });
  }, [theme]);

  const value = useMemo<AppState>(
    () => ({
      lang,
      dir,
      isRTL: dir === "rtl",
      t: getDictionary(lang),
      setLang,
      toggleLang: () => setLang(lang === "fa" ? "en" : "fa"),
      theme: hydrated ? theme : "light",
      toggleTheme,
      accent: hydrated ? accent : DEFAULT_ACCENT,
      setAccent,
    }),
    [lang, dir, theme, setLang, toggleTheme, accent, setAccent, hydrated]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
