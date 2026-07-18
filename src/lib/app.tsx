import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionaries, type Dict, type Lang } from "./i18n";

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

function initialLang(): Lang {
  if (typeof window === "undefined") return "fa";
  const stored = localStorage.getItem("sz-lang");
  return stored === "en" ? "en" : "fa";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const dir: "rtl" | "ltr" = lang === "fa" ? "rtl" : "ltr";

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    localStorage.setItem("sz-lang", lang);

    const { title, description } = dictionaries[lang].seo;
    document.title = title;

    const ensureMeta = (attrs: { name?: string; property?: string }) => {
      const selector = attrs.name
        ? `meta[name="${attrs.name}"]`
        : `meta[property="${attrs.property}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        if (attrs.name) el.setAttribute("name", attrs.name);
        if (attrs.property) el.setAttribute("property", attrs.property!);
        document.head.appendChild(el);
      }
      return el;
    };

    ensureMeta({ name: "description" }).setAttribute("content", description);
    ensureMeta({ property: "og:title" }).setAttribute("content", title);
    ensureMeta({ property: "og:description" }).setAttribute("content", description);
    ensureMeta({ property: "og:locale" }).setAttribute("content", lang === "fa" ? "fa_IR" : "en_US");
    ensureMeta({ name: "twitter:title" }).setAttribute("content", title);
    ensureMeta({ name: "twitter:description" }).setAttribute("content", description);

    // Drop legacy keywords if any host/template still injects them.
    document.querySelector('meta[name="keywords"]')?.remove();
  }, [lang, dir]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    localStorage.setItem("sz-theme", theme);
  }, [theme]);

  const value = useMemo<AppState>(
    () => ({
      lang,
      dir,
      isRTL: dir === "rtl",
      t: dictionaries[lang],
      setLang,
      toggleLang: () => setLang((l) => (l === "fa" ? "en" : "fa")),
      theme,
      toggleTheme: () => setTheme((m) => (m === "light" ? "dark" : "light")),
    }),
    [lang, dir, theme]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
