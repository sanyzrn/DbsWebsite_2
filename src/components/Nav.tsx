import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Languages, Menu, Moon, Sun, X } from "lucide-react";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";
import { cn } from "../utils/cn";
import BrandLogo from "./BrandLogo";

export default function Nav() {
  const { t, theme, toggleTheme, toggleLang, lang } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const home = localePath(lang, "/");
  const links = [
    { label: t.nav.projects, to: localePath(lang, "/projects") },
    { label: t.nav.expertise, to: `${home}#expertise` },
    { label: t.nav.process, to: `${home}#process` },
    { label: t.nav.about, to: localePath(lang, "/about") },
    { label: t.nav.contact, to: `${localePath(lang, "/about")}#contact` },
  ];
  const ctaTo = `${localePath(lang, "/about")}#contact/start`;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open ? "border-b border-line bg-page/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="wrap flex h-[72px] items-center justify-between gap-4">
        <Link to={home} className="group flex items-center gap-2.5" aria-label="Saeed Zarrini — home">
          <BrandLogo variant="icon" imgClassName="h-8 w-8 object-contain opacity-90 transition-opacity group-hover:opacity-100" alt="" />
          <span className="flex flex-col leading-none">
            <span dir="ltr" className="text-[17px] font-extrabold tracking-tight">
              Saeed<span className="text-hi">Zarrini</span>
              <span className="ms-1 inline-block h-[7px] w-[7px] rounded-[2px] bg-accent align-baseline transition-transform duration-300 group-hover:rotate-45" />
            </span>
            <span className="mt-1.5 text-[10px] font-medium text-ink2">{t.brand.sub}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((l) => (
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
            aria-label="Switch language"
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
            onClick={() => setOpen(!open)}
            aria-label={open ? t.nav.close : t.nav.menu}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-line text-ink transition-colors hover:border-hi lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-x-0 top-full z-50 px-4 pt-2 transition-all duration-300 lg:hidden",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        )}
      >
        <nav
          className="mx-auto max-w-lg overflow-hidden rounded-lg border border-line bg-page shadow-[0_18px_50px_-20px_rgba(0,0,0,0.35)]"
          aria-label="Mobile"
        >
          <div className="flex flex-col p-2">
            {links.map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-sm px-3 py-3 text-[15px] font-bold tracking-tight text-ink transition-colors hover:bg-surface hover:text-hi"
              >
                {l.label}
                <span className="font-mono text-[10px] font-medium text-ink3">0{i + 1}</span>
              </Link>
            ))}
          </div>
          <div className="border-t border-line p-3">
            <Link to={ctaTo} onClick={() => setOpen(false)} className="btn btn-primary h-11 w-full text-[13px]">
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
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  );
}
