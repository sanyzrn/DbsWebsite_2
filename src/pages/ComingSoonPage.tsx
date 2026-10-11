import { Link, useLocation } from "react-router-dom";
import { ArrowUpLeft } from "lucide-react";
import { PageMeta } from "../components/PageMeta";
import { useApp } from "../lib/app";
import { isLaunchSlug, LAUNCH_PAGES } from "../lib/launches";
import { localePath, stripLangPrefix } from "../lib/paths";
import "./coming-soon.css";

/**
 * One lean, motion-led canvas for the four product URLs.
 * Animations are pure CSS and stop for prefers-reduced-motion users.
 * No fetches, tracking, external assets or timers.
 */
export default function ComingSoonPage() {
  const { pathname } = useLocation();
  const { lang } = useApp();
  const segment = stripLangPrefix(pathname).split("/").filter(Boolean)[0] ?? "";
  const slug = isLaunchSlug(segment) ? segment : "nex";
  const product = LAUNCH_PAGES[slug];
  const copy = product.copy[lang];

  return (
    <>
      <PageMeta page="launch" slug={slug} />
      <section className={`product-launch product-launch--${slug}`} aria-labelledby="product-launch-title">
        <div className="product-launch__grid" aria-hidden="true" />
        <div className="product-launch__wrap">
          <div className="product-launch__masthead">
            <span className="product-launch__signature">DBS<span className="product-launch__signature-mark">/</span>STUDIO</span>
            <span className="product-launch__edition" dir="ltr">PROJECT PREVIEW / {product.number}</span>
          </div>

          <div className="product-launch__hero">
            <div className="product-launch__art" aria-hidden="true">
              <div className="product-launch__orbit product-launch__orbit--outer" />
              <div className="product-launch__orbit product-launch__orbit--middle" />
              <div className="product-launch__orbit product-launch__orbit--inner" />
              <div className="product-launch__axis product-launch__axis--x" />
              <div className="product-launch__axis product-launch__axis--y" />
              <div className="product-launch__core">
                <span className="product-launch__tile product-launch__tile--1" />
                <span className="product-launch__tile product-launch__tile--2" />
                <span className="product-launch__tile product-launch__tile--3" />
                <span className="product-launch__tile product-launch__tile--4" />
              </div>
              <div className="product-launch__locator"><span /></div>
              <span className="product-launch__coordinates">DBS—0{product.number}</span>
            </div>

            <div className="product-launch__copy">
              <div className="product-launch__status">
                <span className="product-launch__status-light" aria-hidden="true" />
                <span>{copy.label}</span>
                <span className="product-launch__status-line" aria-hidden="true" />
                <span dir="ltr">00 / {product.number}</span>
              </div>
              <h1 id="product-launch-title" className="product-launch__name" dir="ltr">{product.name}</h1>
              <p className="product-launch__tagline">{copy.line}</p>
              <p className="product-launch__note">{copy.note}</p>
              <Link className="product-launch__back" to={localePath(lang, "/")}>
                <span className="product-launch__back-icon" aria-hidden="true"><ArrowUpLeft size={19} strokeWidth={1.6} /></span>
                <span>{copy.back}</span>
              </Link>
            </div>
          </div>

          <div className="product-launch__foot">
            <span>© DbsStudio</span>
            <span className="product-launch__foot-rule" aria-hidden="true"><i /></span>
            <span>{copy.footer}</span>
          </div>
        </div>
      </section>
    </>
  );
}
