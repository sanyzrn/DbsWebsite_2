import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Globe } from "lucide-react";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";
import { cn } from "../utils/cn";
import { LinkedinIcon, GithubIcon } from "./icons";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  const { t, lang } = useApp();
  const [showTop, setShowTop] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const home = localePath(lang, "/");
  const links = [
    { label: t.nav.projects, to: localePath(lang, "/projects") },
    { label: t.nav.expertise, to: `${home}#expertise` },
    { label: t.nav.process, to: `${home}#process` },
    { label: t.nav.about, to: localePath(lang, "/about") },
    { label: t.nav.contact, to: `${localePath(lang, "/about")}#contact` },
  ];

  const socials = [
    {
      icon: GithubIcon,
      label: "GitHub",
      href: "https://github.com/sanyzrn/",
    },
    {
      icon: LinkedinIcon,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/saeed-zarrini-20a56341",
    },
    {
      icon: Globe,
      label: "DBSGraphic",
      href: "https://dbsgraphic.ir/",
    },
  ];

  return (
    <footer className="border-t border-line">
      <div className="wrap py-8 md:hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link to={home} className="inline-flex leading-none">
              <span dir="ltr" className="text-[18px] font-extrabold tracking-tight">
                Saeed<span className="text-hi">Zarrini</span>
                <span className="ms-1.5 inline-block h-1.5 w-1.5 rounded-[2px] bg-accent align-baseline" />
              </span>
            </Link>
            <p className="mt-2 text-[12px] font-bold leading-5 text-hi">{t.footer.tagline}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-ink2 transition-colors hover:border-hi hover:text-hi"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <p className="mt-3 text-[12.5px] leading-6 text-ink2">{t.footer.desc}</p>

        <nav aria-label={t.footer.navTitle} className="mt-5 flex flex-wrap gap-x-1 gap-y-1">
          {links.map((l, i) => (
            <span key={l.to} className="inline-flex items-center">
              <Link to={l.to} className="px-1.5 py-1 text-[13px] font-semibold text-ink2 transition-colors hover:text-hi">
                {l.label}
              </Link>
              {i < links.length - 1 && (
                <span className="text-line2" aria-hidden="true">
                  ·
                </span>
              )}
            </span>
          ))}
        </nav>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <a href={`mailto:${t.contact.email}`} dir="ltr" className="text-[12.5px] font-bold text-ink2 transition-colors hover:text-hi">
            {t.contact.email}
          </a>
          <p className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-ink3" dir="ltr">
            <BrandLogo variant="icon" imgClassName="h-3.5 w-3.5 object-contain" alt="" />
            DBSGraphic
          </p>
        </div>

        <p className="mt-4 text-[11px] leading-5 text-ink3">
          © {year} <span dir="ltr">SaeedZarrini</span> — {t.footer.rights}
        </p>
      </div>

      <div className="wrap hidden gap-12 py-16 md:grid md:grid-cols-12">
        <div className="md:col-span-6">
          <Link to={home} className="inline-flex flex-col leading-none">
            <span dir="ltr" className="text-[22px] font-extrabold tracking-tight">
              Saeed<span className="text-hi">Zarrini</span>
              <span className="ms-1.5 inline-block h-2 w-2 rounded-[2px] bg-accent align-baseline" />
            </span>
          </Link>
          <p className="mt-3.5 text-[13.5px] font-bold text-hi">{t.footer.tagline}</p>
          <p className="mt-4 max-w-sm text-[13.5px] leading-7 text-ink2">{t.footer.desc}</p>
          <p className="mt-6 inline-flex items-center gap-2.5 rounded-xs border border-line px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-ink3" dir="ltr">
            <BrandLogo variant="icon" imgClassName="h-4 w-4 object-contain" alt="" />
            {t.footer.studio}
          </p>
        </div>

        <div className="md:col-span-3">
          <h3 className="mb-5 text-[12.5px] font-bold uppercase tracking-wider text-ink3">{t.footer.navTitle}</h3>
          <ul className="space-y-3">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-[14px] font-semibold text-ink2 transition-colors hover:text-hi">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h3 className="mb-5 text-[12.5px] font-bold uppercase tracking-wider text-ink3">{t.footer.socialTitle}</h3>
          <div className="flex gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-11 w-11 items-center justify-center rounded-sm border border-line text-ink2 transition-all duration-300 hover:-translate-y-1 hover:border-hi hover:text-hi"
              >
                <s.icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
          <a href={`mailto:${t.contact.email}`} dir="ltr" className="mt-6 inline-block text-[13.5px] font-bold text-ink2 transition-colors hover:text-hi">
            {t.contact.email}
          </a>
        </div>
      </div>

      <div className="hidden border-t border-line md:block">
        <div className="wrap flex flex-wrap items-center justify-between gap-4 py-6">
          <p className="text-[12px] font-medium text-ink3">
            © {year} <span dir="ltr">SaeedZarrini</span> — {t.footer.rights}
          </p>
          <p className="text-[12px] font-medium text-ink3">{t.footer.built}</p>
        </div>
      </div>

      <Link
        to={`${home}#top`}
        aria-label={t.footer.backTop}
        className={cn(
          "fixed bottom-6 end-6 z-40 flex h-11 w-11 items-center justify-center rounded-sm bg-accent text-[#211a10] shadow-lg transition-all duration-500 hover:-translate-y-1 print:hidden",
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        <ArrowUp className="h-5 w-5" strokeWidth={2.4} />
      </Link>
    </footer>
  );
}
