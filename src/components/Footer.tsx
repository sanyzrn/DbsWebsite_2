import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useApp } from "../lib/app";
import { cn } from "../utils/cn";
import { DribbbleIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "./icons";

export default function Footer() {
  const { t } = useApp();
  const [showTop, setShowTop] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: t.nav.projects, href: "#projects" },
    { label: t.nav.expertise, href: "#expertise" },
    { label: t.nav.process, href: "#process" },
    { label: t.nav.about, href: "#about" },
    { label: t.nav.contact, href: "#contact" },
  ];

  const socials = [
    { icon: GithubIcon, label: "GitHub" },
    { icon: LinkedinIcon, label: "LinkedIn" },
    { icon: InstagramIcon, label: "Instagram" },
    { icon: DribbbleIcon, label: "Dribbble" },
  ];

  return (
    <footer className="border-t border-line">
      <div className="wrap grid gap-12 py-16 md:grid-cols-12">
        {/* brand */}
        <div className="md:col-span-6">
          <a href="#top" className="inline-flex flex-col leading-none">
            <span dir="ltr" className="text-[22px] font-extrabold tracking-tight">
              Saeed<span className="text-hi">Zarrini</span>
              <span className="ms-1.5 inline-block h-2 w-2 rounded-[2px] bg-accent align-baseline" />
            </span>
          </a>
          <p className="mt-3.5 text-[13.5px] font-bold text-hi">{t.footer.tagline}</p>
          <p className="mt-4 max-w-sm text-[13.5px] leading-7 text-ink2">{t.footer.desc}</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-xs border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink3" dir="ltr">
            <span className="h-1.5 w-1.5 rounded-[2px] bg-accent" />
            DBSGraphic — creative & product studio
          </p>
        </div>

        {/* quick links */}
        <div className="md:col-span-3">
          <h3 className="mb-5 text-[12.5px] font-bold uppercase tracking-wider text-ink3">{t.footer.navTitle}</h3>
          <ul className="space-y-3">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-[14px] font-semibold text-ink2 transition-colors hover:text-hi">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* socials */}
        <div className="md:col-span-3">
          <h3 className="mb-5 text-[12.5px] font-bold uppercase tracking-wider text-ink3">{t.footer.socialTitle}</h3>
          <div className="flex gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href="#top"
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

      {/* bottom bar */}
      <div className="border-t border-line">
        <div className="wrap flex flex-wrap items-center justify-between gap-4 py-6">
          <p className="text-[12px] font-medium text-ink3">
            © {year} <span dir="ltr">SaeedZarrini</span> — {t.footer.rights}
          </p>
          <p className="text-[12px] font-medium text-ink3">{t.footer.built}</p>
        </div>
      </div>

      {/* back to top */}
      <a
        href="#top"
        aria-label={t.footer.backTop}
        className={cn(
          "fixed bottom-6 end-6 z-40 flex h-11 w-11 items-center justify-center rounded-sm bg-accent text-[#211a10] shadow-lg transition-all duration-500 hover:-translate-y-1",
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        <ArrowUp className="h-5 w-5" strokeWidth={2.4} />
      </a>
    </footer>
  );
}
