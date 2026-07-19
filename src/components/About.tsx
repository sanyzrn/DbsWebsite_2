import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Layers } from "lucide-react";
import { useApp } from "../lib/app";
import type { Dict } from "../lib/i18n";
import { cn } from "../utils/cn";
import { Reveal, SectionHead } from "./ui";

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
    <ol
      className="career-timeline"
      style={{ ["--career-draw" as string]: String(drawClamped) }}
      aria-label={label ?? "Career path"}
    >
      <span className="career-rail" aria-hidden="true">
        <span className="career-rail-track" />
        <span className="career-rail-draw" />
      </span>

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
/*  About                                                               */
/* ------------------------------------------------------------------ */

export default function About() {
  const { t } = useApp();

  return (
    <section id="about" className="section-pad border-t border-line bg-surface">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Reveal className="lg:sticky lg:top-28">
              <figure className="relative overflow-hidden rounded-lg border border-line sm:rounded-xl">
                <img
                  src="/images/studio.jpg"
                  alt={t.about.title}
                  loading="lazy"
                  className="aspect-[16/11] w-full object-cover transition-transform duration-[1200ms] hover:scale-[1.03] lg:aspect-[20/23]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-12 sm:p-5 sm:pt-16" dir="ltr">
                  <span className="inline-flex items-center gap-2.5">
                    <img src="/Dbs_logo_single.webp" alt="" className="h-5 w-5 object-contain" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/80 sm:text-[10px] sm:tracking-[0.2em]">
                      DBSGraphic — creative & product studio
                    </span>
                  </span>
                </div>
                <span className="absolute end-3 top-3 rounded-xs border border-white/25 bg-black/30 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/85 backdrop-blur sm:end-4 sm:top-4 sm:px-2.5" dir="ltr">
                  since 2008
                </span>
              </figure>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <SectionHead kicker={t.about.kicker} title={t.about.title} />
            <Reveal delay={200}>
              <p className="mt-5 max-w-2xl text-[14px] leading-7 text-ink2 sm:mt-7 sm:text-[15px] sm:leading-[1.95]">{t.about.p1}</p>
            </Reveal>
            <Reveal delay={260}>
              <p className="mt-4 max-w-2xl text-[18px] font-black leading-[1.55] tracking-tight text-hi sm:mt-6 sm:text-[20px] sm:leading-[1.7] md:text-[24px]">
                {t.about.question}
              </p>
            </Reveal>
            <Reveal delay={320}>
              <p className="mt-4 max-w-2xl text-[14px] leading-7 text-ink2 sm:mt-6 sm:text-[15px] sm:leading-[1.95]">{t.about.p2}</p>
            </Reveal>
            <Reveal delay={380}>
              <p className="mt-5 max-w-2xl text-[14px] font-bold leading-7 sm:mt-8 sm:text-[15px] sm:leading-8">{t.about.p3}</p>
            </Reveal>
            <Reveal delay={440}>
              <ul className="mt-4 grid max-w-2xl gap-x-6 gap-y-2.5 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-3">
                {t.about.checklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[13.5px] font-semibold sm:gap-3 sm:text-[14.5px]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-hi/50 bg-hi/10 text-hi sm:h-6 sm:w-6">
                      <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={500}>
              <p className="mt-6 inline-flex items-center gap-2.5 rounded-sm border border-line bg-page px-3.5 py-2.5 text-[12px] font-semibold text-ink2 sm:mt-9 sm:px-4 sm:py-3 sm:text-[12.5px]">
                <Layers className="h-4 w-4 text-hi" />
                {t.about.studioNote}
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-12 grid gap-8 border-t border-line pt-10 md:mt-16 md:gap-12 md:pt-14 lg:mt-20 lg:grid-cols-12 lg:pt-16">
          <div className="lg:col-span-6">
            <Reveal>
              <h3 className="text-[22px] font-extrabold leading-[1.3] tracking-tight sm:text-[26px] md:text-[32px]">{t.about.expTitle}</h3>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 max-w-xl text-[14px] leading-7 text-ink2 sm:mt-6 sm:text-[15px] sm:leading-[1.95]">{t.about.expBody}</p>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-5 max-w-xl rounded-sm border-s-[3px] border-hi bg-page px-4 py-3 text-[14px] font-bold leading-7 sm:mt-7 sm:px-5 sm:py-4 sm:text-[15px] sm:leading-8">
                {t.about.expClosing}
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={160}>
              <CareerTimeline nodes={t.about.path} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Skills                                                              */
/* ------------------------------------------------------------------ */

export function Skills() {
  const { t } = useApp();

  return (
    <section id="skills" className="section-pad border-t border-line">
      <div className="wrap">
        <SectionHead kicker={t.skills.kicker} title={t.skills.title} lead={t.skills.lead} />

        {/* Mobile: collapsible categories */}
        <div className="mt-8 space-y-2 md:hidden">
          {t.skills.cats.map((cat, i) => (
            <details
              key={cat.en}
              className="group rounded-md border border-line bg-surface open:border-hi/40"
              open={i === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="block text-[15px] font-extrabold tracking-tight">{cat.title}</span>
                  <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-ink3" dir="ltr">
                    {cat.en}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-ink3 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="flex flex-wrap gap-1.5 border-t border-line px-4 py-3.5">
                {cat.items.map((item) => (
                  <span key={item} className={cn("chip text-[11px]", cat.mono && "chip-mono")}>
                    {item}
                  </span>
                ))}
              </div>
            </details>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="mt-10 hidden gap-5 md:grid md:grid-cols-2">
          {t.skills.cats.map((cat, i) => (
            <Reveal key={cat.en} delay={i * 80} className="h-full">
              <div className="h-full rounded-lg border border-line bg-surface p-6 transition-colors duration-400 hover:border-hi/50 lg:p-7">
                <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-line pb-4">
                  <h3 className="text-[18px] font-extrabold tracking-tight lg:text-[19px]">{cat.title}</h3>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink3" dir="ltr">
                    {cat.en}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span key={item} className={cn("chip chip-hover", cat.mono && "chip-mono")}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
