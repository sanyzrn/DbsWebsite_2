import { useEffect, useState } from "react";
import { Languages, Menu, Moon, Sun, X } from "lucide-react";
import { useApp } from "../lib/app";
import { cn } from "../utils/cn";
import BrandLogo from "./BrandLogo";

export default function Nav() {
  const { t, theme, toggleTheme, toggleLang } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { label: t.nav.projects, href: "#projects" },
    { label: t.nav.expertise, href: "#expertise" },
    { label: t.nav.process, href: "#process" },
    { label: t.nav.about, href: "#about" },
    { label: t.nav.contact, href: "#contact" },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "border-b border-line bg-page/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="wrap flex h-[72px] items-center justify-between gap-4">
        {/* Brand — personal name first; studio mark secondary */}
        <a href="#top" className="group flex items-center gap-2.5" aria-label="Saeed Zarrini — home">
          <BrandLogo variant="icon" imgClassName="h-8 w-8 object-contain opacity-90 transition-opacity group-hover:opacity-100" alt="" />
          <span className="flex flex-col leading-none">
            <span dir="ltr" className="text-[17px] font-extrabold tracking-tight">
              Saeed<span className="text-hi">Zarrini</span>
              <span className="ms-1 inline-block h-[7px] w-[7px] rounded-[2px] bg-accent align-baseline transition-transform duration-300 group-hover:rotate-45" />
            </span>
            <span className="mt-1.5 text-[10px] font-medium text-ink2">{t.brand.sub}</span>
          </span>
        </a>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-sm px-3.5 py-2 text-[13.5px] font-semibold text-ink2 transition-colors duration-300 hover:text-hi"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Controls */}
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
          <a href="#contact" className="btn btn-primary hidden h-10 px-5 text-[13px] md:inline-flex">
            {t.nav.cta}
          </a>
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

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-x-0 top-[72px] bottom-0 z-40 bg-page transition-all duration-500 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <nav className="wrap flex h-full flex-col gap-1 overflow-y-auto pt-8 pb-16" aria-label="Mobile">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: `${i * 55}ms` }}
              className={cn(
                "flex items-center justify-between border-b border-line py-5 text-[22px] font-extrabold tracking-tight transition-all duration-500 hover:text-hi",
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
            >
              {l.label}
              <span className="font-mono text-[11px] font-medium text-ink3">0{i + 1}</span>
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className={cn(
              "btn btn-primary mt-8 w-full transition-all duration-500",
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
            style={{ transitionDelay: "300ms" }}
          >
            {t.nav.cta}
          </a>
          <p className="mt-auto flex items-center justify-center gap-2 pt-10 text-center text-[11px] text-ink3" dir="ltr">
            <BrandLogo variant="icon" imgClassName="h-4 w-4 object-contain opacity-80" alt="" />
            SaeedZarrini — {t.footer.tagline}
          </p>
        </nav>
      </div>
    </header>
  );
}
