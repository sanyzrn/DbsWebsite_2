import { useId } from "react";
import { Code2, PenTool, Sparkles } from "lucide-react";
import { useApp } from "../lib/app";
import { cn } from "../utils/cn";
import { Reveal } from "./ui";

const manifestoIcons = [PenTool, Code2, Sparkles];

/* ------------------------------------------------------------------ */
/*  Practice graph — Design · Engineering · Intelligence → Product     */
/*  Ambient node network: three disciplines continually feeding one     */
/*  connected practice. No fake product constellation.                  */
/* ------------------------------------------------------------------ */

type SourceKey = "design" | "engineering" | "intelligence";

const SOURCES: { key: SourceKey; x: number; y: number }[] = [
  { key: "design", x: 200, y: 56 },
  { key: "engineering", x: 200, y: 160 },
  { key: "intelligence", x: 200, y: 264 },
];

const PRODUCT = { x: 820, y: 160 };

function edgePath(sx: number, sy: number, ex: number, ey: number) {
  const mx = (sx + ex) / 2;
  return `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}`;
}

function PracticeGraph() {
  const { t } = useApp();
  const { ecosystem: eco } = t;
  const uid = useId().replace(/:/g, "");
  const glowId = `pg-glow-${uid}`;
  const flowId = `pg-flow-${uid}`;

  return (
    <div className="atlas-band relative hidden overflow-hidden border-y border-line bg-surface md:block" aria-label={eco.label}>
      <div className="atlas-grid pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden="true" />

      <div className="wrap relative py-9 md:py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-[2px] bg-hi" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">{eco.fig}</span>
          </div>
          <p className="text-[13px] font-medium tracking-tight text-ink2 md:text-[14px]">{eco.lead}</p>
        </div>

        <div className="practice-graph relative mx-auto w-full max-w-4xl" dir="ltr">
          <svg
            className="h-auto w-full"
            viewBox="0 0 1000 320"
            role="img"
            aria-labelledby={`pg-title-${uid}`}
          >
            <title id={`pg-title-${uid}`}>{eco.label}</title>
            <defs>
              <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--hi)" stopOpacity="0.35" />
                <stop offset="55%" stopColor="var(--hi)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="var(--hi)" stopOpacity="0" />
              </radialGradient>
              <linearGradient id={flowId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--hi)" stopOpacity="0" />
                <stop offset="45%" stopColor="var(--hi)" stopOpacity="0.85" />
                <stop offset="100%" stopColor="var(--hi)" stopOpacity="0" />
              </linearGradient>
            </defs>

            <circle className="practice-glow" cx={PRODUCT.x} cy={PRODUCT.y} r="78" fill={`url(#${glowId})`} />

            {SOURCES.map((s) => (
              <path
                key={`base-${s.key}`}
                d={edgePath(s.x + 14, s.y, PRODUCT.x - 28, PRODUCT.y)}
                fill="none"
                stroke="var(--line2)"
                strokeWidth="1.25"
                strokeOpacity="0.7"
              />
            ))}

            {SOURCES.map((s, i) => (
              <path
                key={`flow-${s.key}`}
                className={cn("practice-flow", `practice-flow-${i + 1}`)}
                d={edgePath(s.x + 14, s.y, PRODUCT.x - 28, PRODUCT.y)}
                fill="none"
                stroke={`url(#${flowId})`}
                strokeWidth="2.25"
                strokeLinecap="round"
                pathLength={100}
              />
            ))}

            {SOURCES.map((s) => (
              <g key={s.key} className="practice-node">
                <circle cx={s.x} cy={s.y} r="7" fill="var(--surface)" stroke="var(--hi)" strokeWidth="1.5" />
                <circle cx={s.x} cy={s.y} r="2.5" fill="var(--hi)" />
                <text
                  x={s.x - 22}
                  y={s.y + 5}
                  textAnchor="end"
                  fill="var(--ink)"
                  fontSize="15"
                  fontWeight="700"
                  style={{ fontFamily: "inherit" }}
                >
                  {eco.sources[s.key]}
                </text>
              </g>
            ))}

            <g className="practice-product">
              <circle cx={PRODUCT.x} cy={PRODUCT.y} r="34" fill="var(--page)" stroke="var(--hi)" strokeWidth="1.5" />
              <circle
                className="practice-product-ring"
                cx={PRODUCT.x}
                cy={PRODUCT.y}
                r="46"
                fill="none"
                stroke="var(--hi)"
                strokeOpacity="0.35"
                strokeWidth="1"
              />
              <circle className="practice-product-core" cx={PRODUCT.x} cy={PRODUCT.y} r="6" fill="var(--hi)" />
              <text
                x={PRODUCT.x}
                y={PRODUCT.y + 68}
                textAnchor="middle"
                fill="var(--ink)"
                fontSize="16"
                fontWeight="800"
                style={{ fontFamily: "inherit" }}
              >
                {eco.product}
              </text>
            </g>
          </svg>

          <p className="mt-2 text-center font-mono text-[10px] tracking-[0.16em] text-ink3 md:mt-3">{eco.caption}</p>
        </div>
      </div>
    </div>
  );
}

export default function Intro() {
  const { t } = useApp();

  return (
    <>
      <PracticeGraph />

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
