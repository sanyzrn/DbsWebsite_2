import { StudioDiscovery, StudioSignature } from "../components/StudioFamily";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { NexaChatWidget } from "../components/nexachat/NexaChatWidget";
import { useApp } from "../lib/app";
import { DEMO_KNOWLEDGE } from "../lib/nexachat/demo";
import { NEXACHAT_BUY_URL, NEXACHAT_COPY } from "../lib/nexachat/copy";
import { NEXACHAT_LANDING, NEXACHAT_SHOTS } from "../lib/nexachat/landing";
import { askNexaChat, openNexaChat } from "../lib/nexachat/widgetControl";
import { localePath } from "../lib/paths";
import "./nexachat.css";

const ICONS: ReactNode[] = [
  <path key="0" d="M4 12.5 9 17.5 20 6.5" />,
  <path key="1" d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm3 4h8M8 12h8" />,
  <path key="2" d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3M7 6h10v12H7z" />,
  <path key="3" d="M4 6h9M8.5 4v2M6 14c3-1.5 5-4 5.5-8M5 14c1.5 2 3.5 3 6 3.5M14 20l4-10 4 10M15.5 17h5" />,
  <path key="4" d="M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v4H4zM17 15h3v4h-3zM20 19a4 4 0 0 1-4 3h-2" />,
  <path key="5" d="M3 4h2.5l2 11h10l2-8H7M10 20a1 1 0 1 0 0 .01M17 20a1 1 0 1 0 0 .01" />,
];

function Icon({ n }: { n: number }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[n % ICONS.length]}
    </svg>
  );
}

function Shot({ src, title, placeholder }: { src: string | null; title: string; placeholder: string }) {
  return (
    <div className="ncl-shot__frame">
      <div className="ncl-shot__bar" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      {src ? (
        <img src={src} alt={title} loading="lazy" decoding="async" />
      ) : (
        <div className="ncl-shot__empty" role="img" aria-label={`${placeholder}: ${title}`}>
          <svg viewBox="0 0 64 48" width="56" height="42" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="3" width="58" height="42" rx="5" />
            <path d="M3 33 20 20l12 10 10-8 19 15M44 14a3 3 0 1 0 0 .01" />
          </svg>
          <span>{placeholder}</span>
        </div>
      )}
    </div>
  );
}

export default function NexaChatPage() {
  const { lang, toggleLang } = useApp();
  const c = NEXACHAT_COPY[lang];
  const l = NEXACHAT_LANDING[lang];
  const starters = DEMO_KNOWLEDGE[lang].starters;
  const [hint, setHint] = useState(false);
  const dismissed = useRef(false);
  const dismiss = useCallback(() => {
    dismissed.current = true;
    setHint(false);
  }, []);

  // The invitation to the corner launcher appears once the visitor has scrolled past the hero.
  useEffect(() => {
    const onScroll = () => {
      if (!dismissed.current && window.scrollY > 700) setHint(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.(".ssc-launcher")) dismiss();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [dismiss]);

  const open = useCallback(() => {
    dismiss();
    openNexaChat();
  }, [dismiss]);
  const ask = useCallback(
    (question: string) => {
      dismiss();
      askNexaChat(question);
    },
    [dismiss]
  );

  return (
    <div className="ncl" dir={lang === "fa" ? "rtl" : "ltr"} lang={lang}>
      <PageMeta page="nexachat" />

      <header className="ncl-top">
        <div className="ncl-wrap ncl-top__in">
          <a className="ncl-brand" href="#top" aria-label="NexaChatAI">
            <span className="ncl-brand__mark" aria-hidden="true" />
            NexaChatAI
          </a>
          <StudioSignature />
          <nav className="ncl-nav" aria-label="NexaChatAI">
            <a href="#features">{l.nav.features}</a>
            <a href="#demo">{l.nav.demo}</a>
            <a href="#panel">{l.nav.dashboard}</a>
            <a href="#why">{l.nav.why}</a>
            <a href="#faq">{l.nav.faq}</a>
          </nav>
          <div className="ncl-top__end">
            <button type="button" className="ncl-lang" onClick={toggleLang} lang={lang === "fa" ? "en" : "fa"}>
              {l.langSwitch}
            </button>
            <a className="ncl-btn ncl-btn--solid ncl-btn--sm" href={NEXACHAT_BUY_URL} target="_blank" rel="noopener noreferrer">
              {c.ctaBuy}
            </a>
          </div>
        </div>
      </header>

      <div id="top">
        <section className="ncl-hero">
          <div className="ncl-wrap ncl-hero__grid">
            <div className="ncl-hero__copy">
              <p className="ncl-eyebrow">{l.eyebrow}</p>
              <h1 className="ncl-h1">
                {l.headA} <span>{l.headB}</span>
              </h1>
              <p className="ncl-lead">{l.lead}</p>
              <div className="ncl-cta">
                <a className="ncl-btn ncl-btn--solid" href={NEXACHAT_BUY_URL} target="_blank" rel="noopener noreferrer">
                  {c.ctaBuy}
                </a>
                <button type="button" className="ncl-btn ncl-btn--ghost" onClick={open}>
                  {l.ctaDemo}
                </button>
              </div>
              <ul className="ncl-badges ncl-desk">
                {l.badges.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <p className="ncl-version">{c.versionLine}</p>
            </div>

            <div className="ncl-hero__art ncl-desk" aria-hidden="true">
              <div className="ncl-store">
                <div className="ncl-store__bar">
                  <i />
                  <i />
                  <i />
                  <span>avasound.example</span>
                </div>
                <div className="ncl-store__head">
                  <b>{l.store.brand}</b>
                  <span>{l.store.menu.join(" · ")}</span>
                </div>
                <div className="ncl-store__banner">
                  <strong>{l.store.bannerTitle}</strong>
                  <span>{l.store.bannerText}</span>
                </div>
                <div className="ncl-store__grid">
                  {l.store.products.map((p, i) => (
                    <div key={p.name} className={`ncl-prod ncl-prod--${i + 1}`}>
                      <div className="ncl-prod__img">{p.tag && <em>{p.tag}</em>}</div>
                      <b>{p.name}</b>
                      <span>{p.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ncl-chatcard">
                <p className="ncl-bubble ncl-bubble--user">{l.store.userMsg}</p>
                <p className="ncl-bubble ncl-bubble--bot">{l.store.botMsg}</p>
                <span className="ncl-src">{l.store.source}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="ncl-stats ncl-desk" aria-label="NexaChatAI">
          <div className="ncl-wrap">
            <ul>
              {l.stats.map((s) => (
                <li key={s.label}>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="demo" className="ncl-sec ncl-demo" aria-labelledby="ncl-demo-t">
          <div className="ncl-wrap">
            <h2 id="ncl-demo-t" className="ncl-h2">
              {l.demo.title}
            </h2>
            <p className="ncl-sub">{l.demo.lead}</p>
            <ul className="ncl-chips">
              {starters.map((q, i) => (
                <li key={q} className={i >= 6 ? "ncl-desk" : undefined}>
                  <button type="button" className="ncl-chip" onClick={() => ask(q)}>
                    {q}
                  </button>
                </li>
              ))}
            </ul>
            <div className="ncl-demo__foot">
              <button type="button" className="ncl-btn ncl-btn--ghost ncl-btn--sm" onClick={open}>
                {l.demo.open}
              </button>
              <p>{l.demo.hint}</p>
            </div>
            <p className="ncl-note">{l.demo.note}</p>
          </div>
        </section>

        <section id="features" className="ncl-sec" aria-labelledby="ncl-f-t">
          <div className="ncl-wrap">
            <h2 id="ncl-f-t" className="ncl-h2">
              {c.features.title}
            </h2>
            <ul className="ncl-cards ncl-cards--3">
              {c.features.items.map((item, i) => (
                <li key={item.name} className={i >= 3 ? "ncl-desk" : undefined}>
                  <span className="ncl-ico">
                    <Icon n={i} />
                  </span>
                  <h3>{item.name}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="panel" className="ncl-sec ncl-panel ncl-desk" aria-labelledby="ncl-p-t">
          <div className="ncl-wrap">
            <h2 id="ncl-p-t" className="ncl-h2">
              {l.dashboard.title}
            </h2>
            <p className="ncl-sub">{l.dashboard.lead}</p>
            <div className="ncl-shots">
              {l.dashboard.shots.map((s, i) => (
                <figure key={s.title} className="ncl-shot">
                  <Shot src={NEXACHAT_SHOTS[i] ?? null} title={s.title} placeholder={l.dashboard.placeholder} />
                  <figcaption>
                    <b>{s.title}</b>
                    <span>{s.text}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="why" className="ncl-sec ncl-desk" aria-labelledby="ncl-w-t">
          <div className="ncl-wrap">
            <h2 id="ncl-w-t" className="ncl-h2">
              {l.why.title}
            </h2>
            <p className="ncl-sub">{l.why.lead}</p>
            <ul className="ncl-why">
              {l.why.items.map((item, i) => (
                <li key={item.name}>
                  <span className="ncl-why__n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ncl-sec ncl-two ncl-desk" aria-labelledby="ncl-for-t">
          <div className="ncl-wrap ncl-two__grid">
            <div>
              <h2 id="ncl-for-t" className="ncl-h2">
                {c.forWho.title}
              </h2>
              <ul className="ncl-list">
                {c.forWho.items.map((item) => (
                  <li key={item.name}>
                    <h3>{item.name}</h3>
                    <p>{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="ncl-h2">{c.steps.title}</h2>
              <ol className="ncl-steps">
                {c.steps.items.map((item) => (
                  <li key={item.name}>
                    <h3>{item.name}</h3>
                    <p>{item.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="ncl-sec ncl-desk" aria-labelledby="ncl-n-t">
          <div className="ncl-wrap">
            <h2 id="ncl-n-t" className="ncl-h2">
              {c.needs.title}
            </h2>
            <ul className="ncl-needs">
              {c.needs.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="faq" className="ncl-sec" aria-labelledby="ncl-q-t">
          <div className="ncl-wrap ncl-faq">
            <h2 id="ncl-q-t" className="ncl-h2">
              {c.faq.title}
            </h2>
            <div>
              {c.faq.items.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ncl-closing">
          <div className="ncl-wrap">
            <h2 className="ncl-h2 ncl-h2--xl">{l.closing.title}</h2>
            <p className="ncl-sub ncl-sub--c">{l.closing.text}</p>
            <div className="ncl-cta ncl-cta--c">
              <a className="ncl-btn ncl-btn--solid" href={NEXACHAT_BUY_URL} target="_blank" rel="noopener noreferrer">
                {c.ctaBuy}
              </a>
              <button type="button" className="ncl-btn ncl-btn--ghost" onClick={open}>
                {l.ctaDemo}
              </button>
            </div>
            <p className="ncl-version">{l.closing.sub}</p>
          </div>
        </section>
      </div>

      <StudioDiscovery />
      <footer className="ncl-foot">
        <div className="ncl-wrap ncl-foot__in">
          <span>
            NexaChatAI · {l.footer.credit}
          </span>
          <span className="ncl-foot__links">
            <Link to={`${localePath(lang, "/issues")}?product=nexachatai`}>{l.footer.report}</Link>
            <a href="#top">{l.footer.backToTop}</a>
          </span>
        </div>
      </footer>

      {hint && (
        <p className="ncl-hint" aria-hidden="true">
          {l.heroHint}
        </p>
      )}
      <NexaChatWidget lang={lang} />
    </div>
  );
}
