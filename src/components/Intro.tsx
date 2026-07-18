import { useState } from "react";
import { Code2, PenTool, Sparkles } from "lucide-react";
import { useApp } from "../lib/app";
import { cn } from "../utils/cn";
import { Reveal } from "./ui";

const manifestoIcons = [PenTool, Code2, Sparkles];

/* ------------------------------------------------------------------ */
/*  Studio Atlas — replaces the repeating product marquee             */
/*  Concept: one composition. Studio as hub, products as unique nodes */
/*  on a blueprint spine. Each product appears once with a domain tag.*/
/* ------------------------------------------------------------------ */

function StudioAtlas() {
  const { t } = useApp();
  const { ecosystem: eco } = t;
  const [active, setActive] = useState<number | null>(null);

  return (
    <div
      className="atlas-band relative overflow-hidden border-y border-line bg-surface"
      aria-label={eco.label}
      onMouseLeave={() => setActive(null)}
    >
      {/* blueprint grain */}
      <div className="atlas-grid pointer-events-none absolute inset-0 opacity-[0.45]" aria-hidden="true" />

      <div className="wrap relative py-8 md:py-10">
        {/* header row */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-[2px] bg-hi" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">{eco.fig}</span>
          </div>
          <p className="text-[13px] font-medium tracking-tight text-ink2 md:text-[14px]">{eco.lead}</p>
        </div>

        {/* atlas body */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
          {/* studio hub */}
          <div className="atlas-hub shrink-0">
            <a
              href="#projects"
              className="group relative flex items-center gap-4 outline-none"
              onMouseEnter={() => setActive(null)}
              onFocus={() => setActive(null)}
            >
              <span className="atlas-hub-ring relative flex h-16 w-16 items-center justify-center rounded-sm border border-hi/40 bg-page md:h-[72px] md:w-[72px]">
                <span className="absolute inset-1 rounded-[3px] border border-dashed border-hi/25" aria-hidden="true" />
                <span className="font-mono text-[15px] font-bold tracking-[0.12em] text-hi md:text-[16px]">DBS</span>
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[18px] font-extrabold tracking-tight text-ink transition-colors group-hover:text-hi md:text-[20px]">
                  {eco.hub}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink3">{eco.hubTag}</span>
              </span>
            </a>
          </div>

          {/* spine + nodes */}
          <div className="relative min-w-0 flex-1">
            {/* connecting spine (desktop) */}
            <div
              className="atlas-spine pointer-events-none absolute start-0 end-0 top-[18px] hidden h-px bg-line lg:block"
              aria-hidden="true"
            />

            <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 lg:gap-x-2">
              {eco.nodes.map((node, i) => {
                const isActive = active === i;
                const isDimmed = active !== null && !isActive;
                const index = String(i + 1).padStart(2, "0");

                return (
                  <li key={node.name} className="atlas-node" style={{ animationDelay: `${120 + i * 70}ms` }}>
                    <a
                      href="#projects"
                      className={cn(
                        "group relative flex flex-col gap-2 outline-none transition-opacity duration-300",
                        isDimmed && "opacity-35"
                      )}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      aria-label={`${node.name} — ${node.tag}`}
                    >
                      {/* node dot on spine */}
                      <span className="relative z-[1] flex items-center gap-2 lg:flex-col lg:items-start lg:gap-3">
                        <span
                          className={cn(
                            "relative flex h-[11px] w-[11px] shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                            isActive
                              ? "border-hi bg-hi scale-110"
                              : "border-line2 bg-surface group-hover:border-hi group-hover:bg-hi"
                          )}
                          aria-hidden="true"
                        >
                          <span
                            className={cn(
                              "absolute h-5 w-5 rounded-full border border-hi/0 transition-all duration-500",
                              isActive && "border-hi/30 scale-100",
                              !isActive && "scale-50"
                            )}
                          />
                        </span>

                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="font-mono text-[9px] tracking-[0.16em] text-ink3">{index}</span>
                          <span
                            className={cn(
                              "truncate text-[13px] font-bold tracking-tight transition-colors duration-300 md:text-[14px]",
                              isActive ? "text-hi" : "text-ink group-hover:text-hi"
                            )}
                          >
                            {node.name}
                          </span>
                          <span
                            className={cn(
                              "font-mono text-[10px] tracking-[0.06em] transition-colors duration-300",
                              isActive ? "text-ink2" : "text-ink3"
                            )}
                          >
                            {node.tag}
                          </span>
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
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

      {/* ------------------------------- intro ------------------------------- */}
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

          {/* manifesto */}
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
