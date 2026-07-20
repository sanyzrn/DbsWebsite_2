import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Languages, Menu, Moon, Sun, X } from "lucide-react";
import { useApp } from "../lib/app";
import { useBodyScrollLock } from "../lib/useBodyScrollLock";
import { useFocusTrap } from "../lib/useFocusTrap";
import { localePath } from "../lib/paths";
import { cn } from "../utils/cn";
import BrandLogo from "./BrandLogo";

const PANEL_ID = "mobile-nav-panel";

export default function Nav() {
  const { t, theme, toggleTheme, toggleLang, lang } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelWrapRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useBodyScrollLock(open);
  useFocusTrap(panelWrapRef, open, { additionalRefs: [toggleRef] });

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const id = window.setTimeout(() => firstLinkRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      const id = window.setTimeout(() => toggleRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  const home = localePath(lang, "/");
  const articlesTo = localePath(lang, "/articles");
  const newsTo = localePath(lang, "/news");
  /** Flat primary destinations — Field Notes is rendered as a primary+secondary pair. */
  const links = [
    { label: t.nav.projects, to: localePath(lang, "/projects") },
    { label: t.nav.expertise, to: `${home}#expertise` },
    { label: t.nav.process, to: `${home}#process` },
    { label: t.nav.about, to: localePath(lang, "/about") },
    { label: t.nav.contact, to: localePath(lang, "/contact") },
  ];
  const ctaTo = localePath(lang, "/contact");

  const fieldNotesDesktop = (
    <div className="flex flex-col items-start px-3.5 py-1">
      <Link
        to={articlesTo}
        className="text-[13.5px] font-semibold text-ink2 transition-colors duration-300 hover:text-hi"
      >
        {t.nav.articles}
      </Link>
      <Link
        to={newsTo}
        className="mt-0.5 text-[11px] font-medium tracking-wide text-ink3 transition-colors duration-300 hover:text-hi"
      >
        {t.nav.news}
      </Link>
    </div>
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open ? "border-b border-line bg-page/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="wrap flex h-[72px] items-center justify-between gap-4">
        <Link to={home} className="group flex items-center gap-2.5" aria-label={t.nav.homeLinkLabel}>
          <BrandLogo variant="icon" imgClassName="h-8 w-8 object-contain opacity-90 transition-opacity group-hover:opacity-100" alt="" />
          <span className="flex flex-col leading-none">
            <span dir="ltr" className="text-[17px] font-extrabold tracking-tight">
              Saeed<span className="text-hi">Zarrini</span>
              <span className="ms-1 inline-block h-[7px] w-[7px] rounded-[2px] bg-accent align-baseline transition-transform duration-300 group-hover:rotate-45" />
            </span>
            <span className="mt-1.5 text-[10px] font-medium text-ink2">{t.brand.sub}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t.nav.primaryNavLabel}>
          <Link
            to={links[0].to}
            className="rounded-sm px-3.5 py-2 text-[13.5px] font-semibold text-ink2 transition-colors duration-300 hover:text-hi"
          >
            {links[0].label}
          </Link>
          {fieldNotesDesktop}
          {links.slice(1).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-sm px-3.5 py-2 text-[13.5px] font-semibold text-ink2 transition-colors duration-300 hover:text-hi"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleLang}
            aria-label={t.nav.switchLangLabel}
            className="flex h-10 items-center gap-1.5 rounded-sm border border-line bg-transparent px-3 text-[12px] font-bold text-ink2 transition-colors duration-300 hover:border-hi hover:text-hi"
          >
            <Languages className="h-4 w-4" strokeWidth={2} />
            {t.theme.lang}
          </button>
          <button
            onClick={toggleTheme}
            aria-label={theme === "light" ? t.theme.toDark : t.theme.toLight}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-line text-ink2 transition-colors duration-300 hover:border-hi hover:text-hi"
          >
            {theme === "light" ? <Moon className="h-[17px] w-[17px]" strokeWidth={2} /> : <Sun className="h-[18px] w-[18px]" strokeWidth={2} />}
          </button>
          <Link to={ctaTo} className="btn btn-primary hidden h-10 px-5 text-[13px] md:inline-flex">
            {t.nav.cta}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? t.nav.close : t.nav.menu}
            aria-expanded={open}
            aria-controls={PANEL_ID}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-line text-ink transition-colors hover:border-hi lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        ref={panelWrapRef}
        inert={!open}
        className={cn(
          "absolute inset-x-0 top-full z-50 px-4 pt-2 transition-all duration-300 lg:hidden",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        )}
      >
        <nav id={PANEL_ID} className="mx-auto max-w-lg overflow-hidden rounded-lg border border-line bg-page shadow-[0_18px_50px_-20px_rgba(0,0,0,0.35)]" aria-label={t.nav.mobileNavLabel}>
          <div className="flex flex-col p-2">
            <Link
              ref={firstLinkRef}
              to={links[0].to}
              onClick={closeMenu}
              className="flex items-center justify-between rounded-sm px-3 py-3 text-[15px] font-bold tracking-tight text-ink transition-colors hover:bg-surface hover:text-hi"
            >
              {links[0].label}
              <span className="font-mono text-[10px] font-medium text-ink3">01</span>
            </Link>
            <Link
              to={articlesTo}
              onClick={closeMenu}
              className="flex items-center justify-between rounded-sm px-3 py-3 text-[15px] font-bold tracking-tight text-ink transition-colors hover:bg-surface hover:text-hi"
            >
              {t.nav.articles}
              <span className="font-mono text-[10px] font-medium text-ink3">02</span>
            </Link>
            <Link
              to={newsTo}
              onClick={closeMenu}
              className="ms-3 flex items-center justify-between rounded-sm border-s border-line px-3 py-2 text-[13px] font-semibold tracking-tight text-ink3 transition-colors hover:bg-surface hover:text-hi"
            >
              {t.nav.news}
            </Link>
            {links.slice(1).map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={closeMenu}
                className="flex items-center justify-between rounded-sm px-3 py-3 text-[15px] font-bold tracking-tight text-ink transition-colors hover:bg-surface hover:text-hi"
              >
                {l.label}
                <span className="font-mono text-[10px] font-medium text-ink3">0{i + 3}</span>
              </Link>
            ))}
          </div>
          <div className="border-t border-line p-3">
            <Link to={ctaTo} onClick={closeMenu} className="btn btn-primary h-11 w-full text-[13px]">
              {t.nav.cta}
            </Link>
          </div>
        </nav>
      </div>

      {open && (
        <button
          type="button"
          aria-label={t.nav.close}
          className="fixed inset-0 top-[72px] z-40 bg-ink/25 backdrop-blur-[1px] lg:hidden"
          onClick={closeMenu}
        />
      )}
    </header>
  );
}
