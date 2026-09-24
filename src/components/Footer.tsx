import { Link, useLocation } from "react-router-dom";
import { useApp } from "../lib/app";
import { hasNewsContent } from "../lib/news";
import { localePath, stripLangPrefix } from "../lib/paths";
import { GithubIcon, TelegramIcon, WhatsappIcon } from "./icons";
import BrandLogo from "./BrandLogo";
import { ColorBar, RegMark } from "./ui";

export default function Footer() {
  const { t, lang } = useApp();
  const { pathname } = useLocation();
  // Build-time constant, not `new Date()` — see the __BUILD_YEAR__ define in vite.config.ts.
  const year = __BUILD_YEAR__;
  const bare = stripLangPrefix(pathname);
  // The contact routes already end on the form — don't stack a second invitation under it.
  const showInvite = bare !== "/contact" && bare !== "/about";

  const home = localePath(lang, "/");
  const showNews = hasNewsContent();
  const links = [
    { label: t.nav.projects, to: localePath(lang, "/projects") },
    { label: t.nav.articles, to: localePath(lang, "/articles") },
    ...(showNews ? [{ label: t.nav.news, to: localePath(lang, "/news") }] : []),
    { label: t.nav.expertise, to: `${home}#expertise` },
    { label: t.nav.process, to: `${home}#process` },
    { label: t.nav.about, to: localePath(lang, "/about") },
    { label: t.nav.contact, to: localePath(lang, "/contact") },
  ];
  const legal = [
    { label: t.footer.privacy, to: localePath(lang, "/privacy") },
    { label: t.footer.terms, to: localePath(lang, "/terms") },
  ];
  const socials = [
    { icon: GithubIcon, label: "GitHub", href: "https://github.com/sanyzrn/" },
    { icon: TelegramIcon, label: "Telegram", href: "https://t.me/dbsgraphic" },
    { icon: WhatsappIcon, label: "WhatsApp", href: "https://wa.me/989301221816" },
  ];

  return (
    <footer className="bg-ink text-page">
      {showInvite && (
        <div className="wrap border-b border-page/15 pb-16 pt-20 md:pb-24 md:pt-32">
          <div className="sheet items-end">
            <div className="lg:col-span-8">
              <p className="display t-page max-w-[12ch]">{t.contact.title}</p>
              <p className="mt-6 max-w-[48ch] text-[18px] text-page/80">{t.contact.strong}</p>
            </div>
            <div className="flex flex-col items-start gap-5 lg:col-span-4 lg:items-end">
              <Link
                to={localePath(lang, "/contact")}
                className="btn bg-page text-ink hover:bg-accent hover:text-on-accent"
              >
                {t.contact.secondary}
              </Link>
              <p className="text-[14px] text-page/75">
                {t.footer.emailCta}{" "}
                <a href={`mailto:${t.contact.email}`} dir="ltr" className="link font-semibold text-page">
                  {t.contact.email}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="wrap py-14 md:py-20">
        <div className="sheet gap-y-12">
          <div className="lg:col-span-4">
            <Link to={home} className="inline-flex items-center gap-3" aria-label={t.nav.homeLinkLabel}>
              <span className="rounded-full bg-page p-1.5">
                <BrandLogo variant="icon" imgClassName="h-7 w-7 object-contain" alt="" />
              </span>
              <span className="text-[17px] font-semibold">{t.hero.person}</span>
            </Link>
            <p className="mt-5 max-w-[38ch] text-[15px] text-page/75">{t.footer.desc}</p>
            <p className="mt-3 text-[14px] text-page/75">
              {t.footer.studio}
            </p>
          </div>

          <nav aria-label={t.footer.navTitle} className="lg:col-span-4 lg:col-start-6">
            <h2 className="text-[14px] text-page/75">{t.footer.navTitle}</h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="link-quiet text-[16px]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3 lg:col-start-10">
            <h2 className="text-[14px] text-page/75">{t.footer.socialTitle}</h2>
            <ul className="mt-5 flex gap-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-page/25 transition-colors hover:border-page hover:bg-page hover:text-ink"
                  >
                    <s.icon className="h-[18px] w-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
            <a href={`mailto:${t.contact.email}`} dir="ltr" className="link-quiet mt-6 inline-block text-[15px]">
              {t.contact.email}
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-page/15 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <RegMark className="h-5 w-5 text-page/75" />
            <p className="text-[13px] text-page/75">
              © {year} <span dir="ltr">DbsStudio</span>. {t.footer.rights}
            </p>
          </div>
          <p className="text-[13px] text-page/75 md:max-w-[46ch] md:text-center">{t.footer.colophon}</p>
          <div className="flex items-center gap-6">
            <nav aria-label={t.footer.privacy} className="flex gap-5">
              {legal.map((l) => (
                <Link key={l.to} to={l.to} className="link-quiet text-[13px] text-page/80">
                  {l.label}
                </Link>
              ))}
            </nav>
            <ColorBar className="hidden sm:flex" />
          </div>
        </div>
      </div>
    </footer>
  );
}
