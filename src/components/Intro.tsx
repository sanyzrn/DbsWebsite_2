import { useId, useState } from "react";
import { Code2, PenTool, Sparkles } from "lucide-react";
import { useApp } from "../lib/app";
import { cn } from "../utils/cn";
import { Reveal } from "./ui";
import BrandLogo from "./BrandLogo";

const manifestoIcons = [PenTool, Code2, Sparkles];

/* ------------------------------------------------------------------ */
/*  Studio Constellation — product ecosystem as a living map           */
/*  Hub = DBSGraphic. Products = unique stars at staggered orbits.     */
/*  No repeating ticker — each product appears once with a domain tag. */
/* ------------------------------------------------------------------ */

/** Vertical orbit offsets (% of canvas) — creates a constellation, not a row */
const ORBITS = [18, 62, 8, 72, 28, 55, 12];

function StudioAtlas() {
  const { t } = useApp();
  const { ecosystem: eco } = t;
  const [active, setActive] = useState<number | null>(null);
  const gradId = useId();

  return (
    <div
      className="atlas-band relative overflow-hidden border-y border-line bg-surface"
      aria-label={eco.label}
      onMouseLeave={() => setActive(null)}
    >
      <div className="atlas-grid pointer-events-none absolute inset-0 opacity-[0.4]" aria-hidden="true" />

      <div className="wrap relative py-9 md:py-11">
        {/* header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3 md:mb-10">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-[2px] bg-hi" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">{eco.fig}</span>
          </div>
          <p className="text-[13px] font-medium tracking-tight text-ink2 md:text-[14px]">{eco.lead}</p>
        </div>

        {/* ---------- mobile / tablet: compact index (no fake constellation) ---------- */}
        <div className="lg:hidden">
          <a href="#projects" className="mb-6 inline-flex items-center gap-3.5">
            <span className="atlas-hub-ring relative flex h-14 w-14 items-center justify-center rounded-sm border border-hi/40 bg-page p-2.5">
              <BrandLogo variant="icon" imgClassName="h-full w-full object-contain" />
            </span>
            <span>
              <span className="block text-[17px] font-extrabold tracking-tight">{eco.hub}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink3">{eco.hubTag}</span>
            </span>
          </a>

          <ul className="divide-y divide-line border-y border-line">
            {eco.nodes.map((node, i) => {
              const isActive = active === i;
              return (
                <li key={node.name} className="atlas-node" style={{ animationDelay: `${80 + i * 45}ms` }}>
                  <a
                    href="#projects"
                    className={cn(
                      "flex items-baseline justify-between gap-3 py-3 transition-colors duration-300",
                      isActive ? "text-hi" : "hover:text-hi"
                    )}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                  >
                    <span className="flex min-w-0 items-baseline gap-3">
                      <span className="font-mono text-[9px] tracking-[0.16em] text-ink3">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate text-[14px] font-bold tracking-tight text-ink">{node.name}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[10px] tracking-[0.04em] text-ink3">{node.tag}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ---------- desktop: constellation canvas ---------- */}
        <div className="relative hidden min-h-[220px] lg:block" dir="ltr">
          {/* SVG star-links from hub → each product */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1000 220"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--hi)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="var(--line2)" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            {eco.nodes.map((_, i) => {
              const x = 210 + (i * 740) / Math.max(eco.nodes.length - 1, 1);
              const y = (ORBITS[i]! / 100) * 220;
              const isActive = active === i;
              const isDimmed = active !== null && !isActive;
              return (
                <path
                  key={i}
                  d={`M 118 110 C 160 110, ${x - 40} ${y}, ${x} ${y}`}
                  fill="none"
                  stroke={isActive ? "var(--hi)" : `url(#${gradId})`}
                  strokeWidth={isActive ? 1.6 : 1}
                  strokeOpacity={isDimmed ? 0.15 : isActive ? 0.9 : 0.55}
                  className="transition-all duration-300"
                />
              );
            })}
            {/* hub glow ring */}
            <circle cx="70" cy="110" r="46" fill="none" stroke="var(--hi)" strokeOpacity="0.18" strokeWidth="1" />
            <circle cx="70" cy="110" r="38" fill="none" stroke="var(--hi)" strokeOpacity="0.12" strokeDasharray="3 5" />
          </svg>

          {/* hub */}
          <a
            href="#projects"
            className="atlas-hub group absolute left-0 top-1/2 z-[2] flex -translate-y-1/2 items-center gap-4"
            onMouseEnter={() => setActive(null)}
            onFocus={() => setActive(null)}
          >
            <span className="atlas-hub-ring relative flex h-[76px] w-[76px] items-center justify-center rounded-sm border border-hi/45 bg-page p-3.5 shadow-[0_0_0_1px_color-mix(in_srgb,var(--hi)_12%,transparent)]">
              <BrandLogo variant="icon" imgClassName="h-full w-full object-contain" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[18px] font-extrabold tracking-tight text-ink transition-colors group-hover:text-hi">
                {eco.hub}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink3">{eco.hubTag}</span>
            </span>
          </a>

          {/* product stars — positioned in LTR canvas coords (dir=ltr on parent) */}
          {eco.nodes.map((node, i) => {
            const leftPct = 21 + (i * 74) / Math.max(eco.nodes.length - 1, 1);
            const topPct = ORBITS[i]!;
            const isActive = active === i;
            const isDimmed = active !== null && !isActive;
            const index = String(i + 1).padStart(2, "0");

            return (
              <a
                key={node.name}
                href="#projects"
                className={cn(
                  "atlas-node group absolute z-[2] -translate-x-1/2 -translate-y-1/2 outline-none transition-opacity duration-300",
                  isDimmed && "opacity-30"
                )}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  animationDelay: `${140 + i * 70}ms`,
                }}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                aria-label={`${node.name} — ${node.tag}`}
              >
                <span className="flex flex-col items-center gap-1.5 text-center">
                  <span
                    className={cn(
                      "relative flex h-3 w-3 items-center justify-center rounded-full border transition-all duration-300",
                      isActive
                        ? "scale-125 border-hi bg-hi"
                        : "border-line2 bg-surface group-hover:border-hi group-hover:bg-hi"
                    )}
                    aria-hidden="true"
                  >
                    <span
                      className={cn(
                        "absolute h-7 w-7 rounded-full border transition-all duration-500",
                        isActive ? "scale-100 border-hi/35" : "scale-50 border-transparent"
                      )}
                    />
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.16em] text-ink3">{index}</span>
                  <span
                    className={cn(
                      "whitespace-nowrap text-[13px] font-bold tracking-tight transition-colors duration-300",
                      isActive ? "text-hi" : "text-ink group-hover:text-hi"
                    )}
                  >
                    {node.name}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10px] tracking-[0.04em] transition-colors duration-300",
                      isActive ? "text-ink2" : "text-ink3"
                    )}
                  >
                    {node.tag}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Intro() {
  const { t } = useApp();

  return (
    <>
      <StudioAtlas />

      <section className="section-pad">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <span className="kicker">{t.intro.kicker}</span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 text-[30px] font-extrabold leading-[1.2] tracking-tight md:text-[40px] md:leading-[1.2]">
                {t.intro.title}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 text-[15px] leading-[1.95] text-ink2">{t.intro.p1}</p>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-4 text-[15px] leading-[1.95] text-ink2">{t.intro.p2}</p>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-7 rounded-sm border-s-[3px] border-hi bg-surface px-5 py-4 text-[15px] font-bold leading-8">
                {t.intro.strong}
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="flex h-full flex-col justify-center">
              {t.intro.manifesto.map((line, i) => {
                const Icon = manifestoIcons[i];
                return (
                  <Reveal key={i} delay={i * 120}>
                    <div className="group flex items-center gap-6 border-b border-line py-7 transition-colors duration-300 first:border-t hover:border-hi/50 md:gap-10 md:py-9">
                      <span className="font-mono text-sm font-semibold text-ink3 transition-colors duration-300 group-hover:text-hi">
                        0{i + 1}
                      </span>
                      <span className="flex-1 text-[24px] font-black leading-snug tracking-tight md:text-[36px] lg:text-[40px]">
                        {line}
                      </span>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-line text-ink2 transition-all duration-300 group-hover:border-hi group-hover:bg-hi group-hover:text-page md:h-14 md:w-14">
                        <Icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.8} />
                      </span>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
