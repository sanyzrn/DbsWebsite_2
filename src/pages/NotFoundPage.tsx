import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import { HeroAtmosphere } from "../components/Hero";
import { PageMeta } from "../components/PageMeta";
import { Reveal } from "../components/ui";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";
import { cn } from "../utils/cn";

/**
 * Creative concept — Option A, "Lost signal":
 * Reuses the Hero topographic atmosphere as a full-bleed field, then soft-warps
 * the center with an SVG displacement filter (feTurbulence + feDisplacementMap)
 * so the pattern briefly unravels where the 404 sits — like a signal hunting for
 * lock. The warp settles after a moment and eases when the pointer leaves the
 * center; prefers-reduced-motion gets the same composition with zero distortion.
 * Decorative only (aria-hidden); real heading / body / home link stay accessible.
 */
export default function NotFoundPage() {
  const { t, lang } = useApp();
  const copy = t.notFound;
  const uid = useId().replace(/:/g, "");
  const filterId = `nf-warp-${uid}`;
  const stageRef = useRef<HTMLElement>(null);
  const rafRef = useRef(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [warp, setWarp] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setWarp(0);
      setSettled(true);
      return;
    }
    // Soft entry warp that locks back onto a clean signal.
    setWarp(16);
    const settle = window.setTimeout(() => {
      setWarp(0);
      setSettled(true);
    }, 2400);
    return () => window.clearTimeout(settle);
  }, [reduceMotion]);

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (reduceMotion || !settled) return;
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.36;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    const radius = Math.min(rect.width, rect.height) * 0.32;
    const proximity = Math.max(0, 1 - dist / radius);
    const next = Math.round(proximity * 12 * 10) / 10;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setWarp(next));
  };

  const onPointerLeave = () => {
    if (reduceMotion) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setWarp(0);
  };

  const fieldStyle: CSSProperties | undefined = reduceMotion
    ? undefined
    : {
        filter: `url(#${filterId})`,
      };

  return (
    <>
      <PageMeta page="notFound" />
      <section
        ref={stageRef}
        className="nf-stage relative overflow-hidden border-t border-line bg-page"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {/* Decorative atmosphere + soft center warp */}
        <div className="nf-atmosphere pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className={cn("nf-atmosphere-field absolute inset-0", !reduceMotion && warp > 0.2 && "nf-atmosphere-warping")}
            style={fieldStyle}
          >
            <HeroAtmosphere />
          </div>

          {/* SVG filter defs live off-layout; scale driven by React state (no canvas). */}
          {!reduceMotion ? (
            <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
              <defs>
                <filter
                  id={filterId}
                  x="-8%"
                  y="-8%"
                  width="116%"
                  height="116%"
                  colorInterpolationFilters="sRGB"
                >
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.018 0.028"
                    numOctaves="2"
                    seed="7"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale={warp}
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
              </defs>
            </svg>
          ) : null}

          {/* Signal ring — geometric, brand-restrained */}
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
