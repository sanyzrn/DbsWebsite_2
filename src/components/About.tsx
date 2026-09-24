import { useEffect, useRef, useState } from "react";
import { useApp } from "../lib/app";
import type { Dict } from "../lib/i18n";
import { cn } from "../utils/cn";
import { SectionHead, Slider } from "./ui";

type PathNode = Dict["about"]["path"][number];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/**
 * Survey-rail career timeline: a vertical measure with scroll-drawn accent fill.
 * Nodes light as they enter view; the rail "draws" down to the farthest reached node.
 * Easter-egg nodes use a diamond marker and aside styling.
 */
export function CareerTimeline({ nodes, label }: { nodes: readonly PathNode[]; label?: string }) {
  const reduceMotion = usePrefersReducedMotion();
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [reached, setReached] = useState<boolean[]>(() =>
    reduceMotion ? nodes.map(() => true) : nodes.map(() => false)
  );

  useEffect(() => {
    if (reduceMotion) {
      setReached(nodes.map(() => true));
      return;
    }

    const observers: IntersectionObserver[] = [];
    itemRefs.current.forEach((el, i) => {
      if (!el || typeof IntersectionObserver === "undefined") return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setReached((prev) => {
              if (prev[i]) return prev;
              const next = [...prev];
              next[i] = true;
              return next;
            });
            io.disconnect();
          }
        },
        { threshold: 0.35, rootMargin: "0px 0px -12% 0px" }
      );
      io.observe(el);
      observers.push(io);
    });

    return () => observers.forEach((io) => io.disconnect());
  }, [nodes, reduceMotion]);

  const farthest = reached.lastIndexOf(true);
  const draw =
    reduceMotion || farthest < 0
      ? reduceMotion
        ? 1
        : 0
      : nodes.length <= 1
        ? 1
        : (farthest + 0.55) / (nodes.length - 0.45);

  const drawClamped = Math.min(1, Math.max(0, draw));

  return (
    <ol className="career-timeline" aria-label={label ?? "Career path"}>
      <svg className="career-rail" aria-hidden="true" width="2" height="100%" viewBox="0 0 2 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="career-rail-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--hi)" />
          </linearGradient>
        </defs>
        <rect className="career-rail-track" x="0" y="0" width="2" height="100" rx="1" />
        {/* SVG transform attribute — not a CSS style=, so CSP style-src stays strict */}
        <rect
          className="career-rail-draw"
          x="0"
          y="0"
          width="2"
          height="100"
          rx="1"
          fill="url(#career-rail-grad)"
          transform={`scale(1 ${drawClamped})`}
        />
      </svg>

      {nodes.map((node, i) => {
        const isEgg = node.kind === "easter-egg";
        const isReached = reached[i];
        const isCurrent = farthest === i;
        return (
          <li
            key={`${node.kind}-${node.year}-${node.title}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={cn(
              "career-node",
              isEgg && "career-node-egg",
              isReached && "is-reached",
              isCurrent && "is-current"
            )}
            data-kind={node.kind}
          >
            <span className="career-node-marker" aria-hidden="true" />
            <span className="career-node-year">{node.year}</span>
            <div className="career-node-copy">
              {isEgg ? <span className="career-node-egg-label">※</span> : null}
              <span className="career-node-title">{node.title}</span>
              <span className="career-node-body">{node.body}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/*  Skills — a Pantone-style fan deck                                   */
/*  Each category is one swatch blade printed in its discipline's plate */
/*  (C design, M engineering, Y AI, spot for the stack); every skill is */
/*  a chip tinted down the blade with a swatch-book code. On desktop    */
/*  the blades fan out from a rivet; hovering one pulls it forward.     */
/* ------------------------------------------------------------------ */

const BLADE_CLASS = ["blade-c", "blade-m", "blade-y", "blade-s"] as const;

function bladeCode(en: string, i: number) {
  return `${en.charAt(0).toUpperCase()}-${String(i + 1).padStart(2, "0")}`;
}

export function Skills() {
  const { t } = useApp();

  return (
    <section id="skills" className="section-pad overflow-hidden border-t border-line">
      <div className="wrap">
        <SectionHead kicker={t.skills.kicker} title={t.skills.title} lead={t.skills.lead} />

        <div className="fandeck mt-10 md:mt-16 lg:mt-24">
          <Slider label={t.skills.title} desktopClassName="fandeck-track" slideClassName="items-start">
            {t.skills.cats.map((cat, c) => (
              <article key={cat.en} className={cn("blade", BLADE_CLASS[c] ?? "blade-s")}>
                <header className="blade-head">
                  <span className="blade-ink" aria-hidden="true" />
                  <h3 className="display text-[1.75rem] leading-none">{cat.title}</h3>
                  <span className="meta tnum" dir="ltr">
                    {cat.items.length}
                  </span>
                </header>
                <ul className="blade-list">
                  {cat.items.map((item, i) => (
                    <li key={item} className="blade-row">
                      <span className="blade-chip" aria-hidden="true" />
                      <span className="min-w-0 flex-1" dir={cat.mono ? "ltr" : undefined}>
                        {item}
                      </span>
                      <span className="blade-code" dir="ltr" aria-hidden="true">
                        {bladeCode(cat.en, i)}
                      </span>
                    </li>
                  ))}
                </ul>
                <span className="blade-rivet" aria-hidden="true" />
              </article>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}
