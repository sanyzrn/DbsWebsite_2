import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useApp } from "../lib/app";
import { useBodyScrollLock } from "../lib/useBodyScrollLock";
import { useFocusTrap } from "../lib/useFocusTrap";
import { hasNewsContent } from "../lib/news";
import { localePath, stripLangPrefix } from "../lib/paths";
import { cn } from "../utils/cn";
import BrandLogo from "./BrandLogo";
import { ColorBar } from "./ui";

const PANEL_ID = "mobile-nav-panel";

function isActive(pathname: string, target: string) {
  const bare = stripLangPrefix(pathname);
  const t = stripLangPrefix(target);
  return bare === t || bare.startsWith(`${t}/`);
}

export default function Nav() {
  const { t, theme, toggleTheme, toggleLang, lang } = useApp();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelWrapRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  // Route change closes the sheet (e.g. language switch from inside it).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  // Document-level outside click/touch — more reliable than a backdrop alone.
  useEffect(() => {
    if (!open) return;
    const onPointerOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (panelWrapRef.current?.contains(target)) return;
      if (toggleRef.current?.contains(target)) return;
      closeMenu();
    };
    document.addEventListener("mousedown", onPointerOutside);
    document.addEventListener("touchstart", onPointerOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerOutside);
      document.removeEventListener("touchstart", onPointerOutside);
    };
  }, [open]);

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
  const newsTo = localePath(lang, "/news");
  const showNews = hasNewsContent();
  const links = [
    { label: t.nav.projects, to: localePath(lang, "/projects") },
    { label: t.nav.articles, to: localePath(lang, "/articles") },
    { label: t.nav.about, to: localePath(lang, "/about") },
    { label: t.nav.contact, to: localePath(lang, "/contact") },
  ];
  const ctaTo = localePath(lang, "/contact");

  return (
    <header
      className={cn(
        "nav-bar fixed inset-x-0 top-0 z-50 border-b border-transparent",
        // backdrop-filter would become the containing block of the fixed menu
        // sheet, so the open state swaps the glass bar for a plain ground.
        scrolled && !open && "is-solid",
        open && "bg-page"
      )}
    >
      <div className="wrap relative z-10 flex h-[68px] items-center justify-between gap-4 md:h-[76px]">
        <Link to={home} className="group flex items-center gap-3" aria-label={t.nav.homeLinkLabel}>
          <BrandLogo variant="icon" imgClassName="h-8 w-8 object-contain" alt="" />
          <span className="hidden text-[15px] font-semibold tracking-[-0.01em] sm:inline" aria-hidden="true">
            {t.hero.person}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label={t.nav.primaryNavLabel}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              aria-current={isActive(pathname, l.to) ? "page" : undefined}
              className="link-quiet text-[15px] font-medium text-ink2 transition-colors hover:text-ink aria-[current=page]:text-ink"
            >
              {l.label}
            </Link>
          ))}
          {showNews && (
            <Link to={newsTo} className="link-quiet text-[13px] text-ink3 hover:text-ink">
              {t.nav.news}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleLang}
            aria-label={t.nav.switchLangLabel}
            className="flex h-10 items-center rounded-full px-3 text-[14px] font-semibold text-ink2 transition-colors hover:bg-surface hover:text-ink"
          >
            <span lang={lang === "fa" ? "en" : "fa"}>{t.theme.lang}</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? t.theme.toDark : t.theme.toLight}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink2 transition-colors hover:bg-surface hover:text-ink"
          >
            {theme === "light" ? <Moon className="h-[18px] w-[18px]" strokeWidth={1.8} /> : <Sun className="h-[18px] w-[18px]" strokeWidth={1.8} />}
          </button>
          <Link to={ctaTo} className="btn btn-primary ms-2 hidden h-11 px-5 text-[14px] md:inline-flex">
            {t.nav.cta}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? t.nav.close : t.nav.menu}
            aria-expanded={open}
            aria-controls={PANEL_ID}
            className="relative ms-1 flex h-11 w-11 items-center justify-center rounded-full border border-ink text-ink transition-colors hover:bg-ink hover:text-page lg:hidden"
          >
            <span aria-hidden="true" className="relative block h-3 w-4">
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-[1.5px] bg-current transition-transform duration-500",
                  open && "translate-y-[5.25px] rotate-45"
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 h-[1.5px] bg-current transition-transform duration-500",
                  open && "-translate-y-[5.25px] -rotate-45"
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        ref={panelWrapRef}
        inert={!open}
        className={cn("menu-sheet fixed inset-0 z-0 bg-page lg:hidden", open && "is-open")}
      >
        <nav
          id={PANEL_ID}
          aria-label={t.nav.mobileNavLabel}
          className="wrap flex h-full flex-col overflow-y-auto pb-8 pt-[96px]"
        >
          <ul className="flex flex-col">
            {links.map((l, i) => (
              <li key={l.to} className="menu-item border-b border-line">
                <Link
                  ref={i === 0 ? firstLinkRef : undefined}
                  to={l.to}
                  onClick={closeMenu}
                  aria-current={isActive(pathname, l.to) ? "page" : undefined}
                  className="display flex items-baseline py-4 text-[2.75rem] transition-colors hover:text-accent aria-[current=page]:text-accent"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {showNews && (
              <li className="menu-item border-b border-line">
                <Link to={newsTo} onClick={closeMenu} className="block py-4 text-[17px] font-semibold text-ink2">
                  {t.nav.news}
                </Link>
              </li>
            )}
          </ul>

          <div className="menu-item mt-auto pt-10">
            <Link to={ctaTo} onClick={closeMenu} className="btn btn-primary w-full">
              {t.nav.cta}
            </Link>
            <div className="mt-6 flex items-center justify-between gap-4">
              <a href={`mailto:${t.contact.email}`} dir="ltr" className="link text-[15px] font-semibold">
                {t.contact.email}
              </a>
              <ColorBar />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
