import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeroAtmosphere } from "../components/Hero";
import { PageMeta } from "../components/PageMeta";
import { Reveal, DecorativeGrid } from "../components/ui";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";
import { cn } from "../utils/cn";

/**
 * Creative concept — Option A, "Lost signal":
 * Reuses the Hero atmosphere as a full-bleed field with a restrained signal ring
 * around the 404 — like a beacon hunting for lock. Decorative only (aria-hidden);
 * real heading / body / home link stay accessible.
 */
export default function NotFoundPage() {
  const { t, lang } = useApp();
  const copy = t.notFound;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <>
      <PageMeta page="notFound" />
      <section className="nf-stage relative overflow-hidden border-t border-line bg-page">
        <DecorativeGrid />
        <div className="nf-atmosphere pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="nf-atmosphere-field absolute inset-0">
            <HeroAtmosphere />
          </div>

          <svg
            className="nf-signal-ring absolute left-1/2 top-[min(38%,14rem)] h-[min(72vw,22rem)] w-[min(72vw,22rem)] -translate-x-1/2 -translate-y-1/2"
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="100"
              cy="100"
              r="78"
              stroke="var(--line2)"
              strokeWidth="1"
              strokeDasharray="2 7"
              opacity="0.7"
              className={cn(!reduceMotion && "nf-signal-spin")}
            />
            <circle cx="100" cy="100" r="58" stroke="var(--accent)" strokeWidth="1.2" opacity="0.28" />
            <circle cx="100" cy="100" r="4" fill="var(--accent)" opacity="0.55" />
            <path
              d="M100 22 V38 M100 162 V178 M22 100 H38 M162 100 H178"
              stroke="var(--accent)"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.45"
            />
          </svg>
        </div>

        <div className="relative z-[1] section-pad">
          <div className="wrap max-w-2xl text-center">
            <Reveal>
              <p className="nf-mark font-mono text-[72px] font-black leading-none tracking-tight text-ink sm:text-[96px] md:text-[112px]" aria-hidden="true">
                404
              </p>
              <h1 className="mt-5 text-[28px] font-extrabold tracking-tight text-ink sm:mt-6 sm:text-[32px] md:text-[40px]">
                {copy.title}
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-[15px] leading-8 text-ink2">{copy.body}</p>
              <Link to={localePath(lang, "/")} className="btn btn-primary mt-8 inline-flex">
                {copy.home}
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
