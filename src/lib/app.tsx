import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { dictionaries, type Dict, type Lang } from "./i18n";
import { langFromPath, localePath, stripLangPrefix } from "./paths";

export type Theme = "light" | "dark";

interface AppState {
  lang: Lang;
  dir: "rtl" | "ltr";
  isRTL: boolean;
  t: Dict;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const AppCtx = createContext<AppState | null>(null);

function initialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("sz-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [lang, setLangState] = useState<Lang>(() => langFromPath(location.pathname));
  const [theme, setTheme] = useState<Theme>(initialTheme);

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
    localStorage.setItem("sz-lang", lang);
  }, [lang, dir]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    localStorage.setItem("sz-theme", theme);
  }, [theme]);

  const setLang = useCallback(
    (next: Lang) => {
      const path = stripLangPrefix(location.pathname);
      navigate(localePath(next, path) + location.hash + location.search);
    },
    [location.pathname, location.hash, location.search, navigate]
  );

  const value = useMemo<AppState>(
    () => ({
      lang,
      dir,
      isRTL: dir === "rtl",
      t: dictionaries[lang],
      setLang,
      toggleLang: () => setLang(lang === "fa" ? "en" : "fa"),
      theme,
      toggleTheme: () => setTheme((m) => (m === "light" ? "dark" : "light")),
    }),
    [lang, dir, theme, setLang]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
