import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Code2, PenTool, Sparkles } from "lucide-react";
import { useApp } from "../lib/app";
import { cn } from "../utils/cn";
import { Reveal } from "./ui";

const manifestoIcons = [PenTool, Code2, Sparkles];

/* ------------------------------------------------------------------ */
/*  Product morph — sketch → wireframe → product                        */
/*  Scroll-triggered once: design → engineering → intelligence.         */
/* ------------------------------------------------------------------ */

type MorphMode = "idle" | "playing" | "static";

function Layer({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={className}>{children}</div>;
}

function SketchStage({ filterId }: { filterId: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-ink3/35 bg-page/80 dark:bg-shot/40">
      <svg viewBox="0 0 480 320" className="h-auto w-full" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-4%" y="-4%" width="108%" height="108%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g fill="none" stroke="currentColor" className="text-ink2 dark:text-shotmut" filter={`url(#${filterId})`} strokeLinecap="round">
          <rect x="18" y="16" width="444" height="288" rx="10" strokeWidth="1.6" />
          <line x1="18" y1="42" x2="462" y2="42" strokeWidth="1.2" />
          <circle cx="36" cy="29" r="3.2" />
          <circle cx="50" cy="29" r="3.2" />
          <circle cx="64" cy="29" r="3.2" />
          <rect x="88" y="23" width="92" height="12" rx="3" strokeWidth="1" />
          <line x1="138" y1="42" x2="138" y2="304" strokeWidth="1.1" />
          <rect x="34" y="58" width="18" height="18" rx="3" strokeWidth="1.3" />
          <line x1="60" y1="67" x2="118" y2="67" strokeWidth="1.4" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <circle cx="42" cy={98 + i * 26} r="3" />
              <line x1="52" y1={98 + i * 26} x2={i === 0 ? 112 : 100} y2={98 + i * 26} strokeWidth="1.3" />
            </g>
          ))}
          <rect x="34" y="240" width="88" height="42" rx="5" strokeWidth="1.2" />
          <line x1="44" y1="256" x2="98" y2="256" strokeWidth="1" />
          <line x1="44" y1="268" x2="112" y2="268" strokeWidth="1.5" />
          <line x1="158" y1="68" x2="248" y2="66" strokeWidth="2" />
          <line x1="158" y1="82" x2="210" y2="82" strokeWidth="1.1" />
          <rect x="360" y="58" width="36" height="16" rx="3" strokeWidth="1" />
          <rect x="404" y="58" width="36" height="16" rx="3" strokeWidth="1.4" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={158 + i * 98} y="104" width="88" height="48" rx="5" strokeWidth="1.3" />
              <line x1={170 + i * 98} y1="122" x2={220 + i * 98} y2="120" strokeWidth="2" />
              <line x1={170 + i * 98} y1="136" x2={200 + i * 98} y2="136" strokeWidth="1" />
            </g>
          ))}
          <rect x="158" y="168" width="282" height="72" rx="5" strokeWidth="1.2" />
          <path d="M170,220 C190,210 210,225 230,200 C250,178 270,205 290,188 C310,172 330,195 350,180 C370,168 390,190 420,175" strokeWidth="1.8" />
          {[42, 58, 48, 70, 52, 78, 60].map((h, i) => (
            <rect key={i} x={158 + i * 40} y={304 - h * 0.55} width="22" height={h * 0.55} rx="2" strokeWidth="1.2" />
          ))}
        </g>
      </svg>
    </div>
  );
}

function WireframeStage() {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface2 dark:border-shotline dark:bg-shotpanel">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 dark:border-shotline">
        <span className="h-2.5 w-2.5 rounded-full bg-line2 dark:bg-shotline" />
        <span className="h-2.5 w-2.5 rounded-full bg-line2 dark:bg-shotline" />
        <span className="h-2.5 w-2.5 rounded-full bg-line2 dark:bg-shotup" />
        <span className="ms-3 hidden h-4 w-24 rounded-xs bg-line/80 dark:bg-shotup sm:block" />
      </div>
      <div className="flex min-h-[220px] sm:min-h-[248px]">
        <div className="hidden w-[30%] border-e border-line p-3.5 dark:border-shotline sm:block">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-xs bg-line2 dark:bg-shotup" />
            <span className="h-2 w-14 rounded-full bg-line dark:bg-shotline" />
          </div>
          {[true, false, false, false, false].map((active, i) => (
            <div key={i} className={cn("mb-1.5 flex items-center gap-2 rounded-xs px-2 py-1.5", active && "bg-line/50 dark:bg-shotup")}>
              <span className="h-1.5 w-1.5 rounded-full bg-line2 dark:bg-shotline" />
              <span className={cn("h-1.5 rounded-full bg-line dark:bg-shotline", active ? "w-16" : "w-12")} />
            </div>
          ))}
          <div className="mt-6 rounded-xs border border-line p-2.5 dark:border-shotline">
            <div className="mb-2 h-1.5 w-10 rounded-full bg-line dark:bg-shotline" />
            <div className="h-1.5 w-full rounded-full bg-line/70 dark:bg-shotup">
              <div className="h-full w-[72%] rounded-full bg-line2 dark:bg-shotmut/50" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-3.5 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="mb-1.5 h-2 w-20 rounded-full bg-line2 dark:bg-shotmut/50" />
              <div className="h-1.5 w-12 rounded-full bg-line dark:bg-shotline" />
            </div>
            <div className="flex gap-1.5">
              <span className="h-5 w-8 rounded-xs border border-line dark:border-shotline" />
              <span className="h-5 w-8 rounded-xs bg-line dark:bg-shotup" />
            </div>
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xs border border-line bg-page/60 px-2.5 py-2 dark:border-shotline dark:bg-shot">
                <div className="h-3 w-10 rounded-sm bg-line2 dark:bg-shotmut/40" />
                <div className="mt-2 h-1 w-8 rounded-full bg-line dark:bg-shotup" />
              </div>
            ))}
          </div>
          <div className="rounded-xs border border-line bg-page/40 p-2.5 dark:border-shotline dark:bg-shot">
            <div className="flex h-16 items-end gap-1 sm:h-[74px]">
              {[38, 55, 42, 70, 48, 82, 60, 74, 50, 66].map((h, i) => (
                <span key={i} className="flex-1 rounded-t-[2px] bg-line2/70 dark:bg-shotup" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between gap-1.5">
            {[42, 66, 50, 80, 58, 92, 70].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-[3px] bg-line/40 dark:bg-shotup" style={{ height: 34 }}>
                <div className="w-full rounded-t-[3px] bg-line2 dark:bg-[#3A4149]" style={{ height: `${h}%`, marginTop: `${100 - h}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const chartPath = "M0,72 L26,64 L52,68 L78,50 L104,55 L130,40 L156,46 L182,30 L208,36 L234,20 L260,27 L286,14 L300,18";

function Dashboard({ gradientId }: { gradientId: string }) {
  const bars = [42, 66, 50, 80, 58, 92, 70];
  return (
    <div className="overflow-hidden rounded-md border border-shotline bg-shotpanel shadow-[0_36px_90px_-24px_rgba(15,16,18,0.55)]">
      <div className="flex items-center gap-2 border-b border-shotline px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#3A4048]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3A4048]" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        <span className="ms-3 hidden rounded-xs border border-shotline bg-shot px-3 py-1 font-mono text-[9px] tracking-wider text-shotmut sm:block">
          dbspulse.app/overview
        </span>
      </div>
      <div className="flex">
        <div className="hidden w-[30%] border-e border-shotline p-3.5 sm:block">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-xs bg-accent font-mono text-[10px] font-bold text-[#211a10]">P</span>
            <span className="h-2 w-14 rounded-full bg-shotup" />
          </div>
          {[true, false, false, false, false].map((active, i) => (
            <div key={i} className={`mb-1.5 flex items-center gap-2 rounded-xs px-2 py-1.5 ${active ? "bg-shotup" : ""}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-accent" : "bg-shotline"}`} />
              <span className={`h-1.5 rounded-full ${active ? "w-16 bg-shotmut/70" : "w-12 bg-shotline"}`} />
            </div>
          ))}
          <div className="mt-6 rounded-xs border border-shotline p-2.5">
            <div className="mb-2 h-1.5 w-10 rounded-full bg-shotline" />
            <div className="h-1.5 w-full rounded-full bg-shotup">
              <div className="h-full w-[72%] rounded-full bg-steel" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-3.5 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="mb-1.5 h-2 w-20 rounded-full bg-shotmut/60" />
              <div className="h-1.5 w-12 rounded-full bg-shotline" />
            </div>
            <div className="flex gap-1.5">
              <span className="rounded-xs border border-shotline px-2 py-1 font-mono text-[8px] text-shotmut">Q3</span>
              <span className="rounded-xs bg-accent px-2 py-1 font-mono text-[8px] font-bold text-[#211a10]">Q4</span>
            </div>
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {[
              { v: "1,284", c: "text-accent" },
              { v: "98.2%", c: "text-sage" },
              { v: "4.7", c: "text-steel" },
            ].map((k, i) => (
              <div key={i} className="rounded-xs border border-shotline bg-shot px-2.5 py-2">
                <div className={`font-mono text-[13px] font-bold ${k.c}`}>{k.v}</div>
                <div className="mt-1 h-1 w-8 rounded-full bg-shotup" />
              </div>
            ))}
          </div>
          <div className="rounded-xs border border-shotline bg-shot p-2.5">
            <svg viewBox="0 0 300 92" className="h-16 w-full sm:h-[74px]" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#BC9463" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#BC9463" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[20, 44, 68].map((y) => (
                <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#2F353D" strokeWidth="1" strokeDasharray="3 5" />
              ))}
              <path d={`${chartPath} L300,92 L0,92 Z`} fill={`url(#${gradientId})`} stroke="none" />
              <path d={chartPath} fill="none" stroke="#BC9463" strokeWidth="2" strokeLinecap="round" />
              <circle cx="234" cy="20" r="3.5" fill="#BC9463" stroke="#131518" strokeWidth="2" />
            </svg>
          </div>
          <div className="mt-3 flex items-end justify-between gap-1.5">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 rounded-t-[3px] bg-shotup" style={{ height: 34 }}>
                <div className={`w-full rounded-t-[3px] ${i === 5 ? "bg-accent" : i === 3 ? "bg-steel/70" : "bg-[#3A4149]"}`} style={{ height: `${h}%`, marginTop: `${100 - h}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesignChip() {
  return (
    <div className="rounded-md border border-line bg-surface2 p-3 shadow-[0_18px_44px_-16px_rgba(28,28,26,0.22)] dark:border-shotline dark:bg-shotpanel dark:shadow-none">
      <div className="flex items-end justify-between">
        <span className="text-[26px] font-black leading-none tracking-tight">Aa</span>
        <span className="font-mono text-[8px] uppercase tracking-wider text-ink3 dark:text-shotmut">Vazirmatn</span>
      </div>
      <div className="mt-2.5 flex gap-1.5">
        {["#BC9463", "#8FB0C0", "#A3B18A", "currentColor"].map((c, i) => (
          <span
            key={i}
            className="h-3.5 w-3.5 rounded-[4px] border border-black/10"
            style={{ background: c === "currentColor" ? undefined : c, color: "var(--ink)" }}
          />
        ))}
      </div>
      <div className="mt-2 font-mono text-[8px] text-ink3 dark:text-shotmut">grid · 8pt · radius 16</div>
    </div>
  );
}

function CodeCard() {
  return (
    <div className="overflow-hidden rounded-md border border-shotline bg-shotpanel shadow-[0_24px_60px_-20px_rgba(15,16,18,0.5)]">
      <div className="flex items-center gap-2 border-b border-shotline px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#3A4048]" />
        <span className="h-2 w-2 rounded-full bg-[#3A4048]" />
        <span className="ms-2 rounded-xs bg-shot px-2 py-0.5 font-mono text-[9px] text-steel">agent.ts</span>
      </div>
      <pre className="p-3.5 font-mono text-[10px] leading-[1.75]">
        <code>
          <span className="text-shotmut">{"// DbsAI · integration layer"}</span>
          {"\n"}
          <span className="text-[#C58FB0]">const</span> <span className="text-shotink">agent</span> <span className="text-shotmut">=</span>{" "}
          <span className="text-steel">createAgent</span>
          <span className="text-shotmut">({"{"}</span>
          {"\n  "}
          <span className="text-shotink">model</span>
          <span className="text-shotmut">:</span> <span className="text-sage">"auto-router"</span>
          <span className="text-shotmut">,</span>
          {"\n  "}
          <span className="text-shotink">tools</span>
          <span className="text-shotmut">:</span> <span className="text-shotmut">[</span>
          <span className="text-accent">search</span>
          <span className="text-shotmut">,</span> <span className="text-accent">workspace</span>
          <span className="text-shotmut">],</span>
          {"\n"}
          <span className="text-shotmut">{"}"});</span>
          {"\n"}
          <span className="text-[#C58FB0]">await</span> <span className="text-shotink">agent</span>
          <span className="text-shotmut">.</span>
          <span className="text-steel">run</span>
          <span className="text-shotmut">(brief);</span>
        </code>
      </pre>
    </div>
  );
}

function AgentCard() {
  return (
    <div className="rounded-md border border-shotline bg-shotpanel p-3.5 shadow-[0_24px_60px_-18px_rgba(15,16,18,0.5)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xs bg-accent/15 text-accent">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
          </span>
          <span className="font-mono text-[10px] font-bold tracking-wide text-shotink">DbsAI · agent</span>
        </div>
        <span className="pulse-dot h-2 w-2 rounded-full bg-sage" />
      </div>
      <div className="mt-3 space-y-2">
        {([["92%", "bg-sage"], ["68%", "bg-steel"]] as const).map(([w, c], i) => (
          <div key={i}>
            <div className="mb-1 flex justify-between font-mono text-[8px] text-shotmut">
              <span>{i === 0 ? "task graph" : "context"}</span>
              <span>{w}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-shotup">
              <div className={`h-full rounded-full ${c}`} style={{ width: w }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-shotline pt-2.5 font-mono text-[8.5px] text-shotmut">
        128k tokens · <span className="text-sage">3 models routed</span>
      </div>
    </div>
  );
}

function PracticeMorph() {
  const { t } = useApp();
  const { ecosystem: eco } = t;
  const uid = useId().replace(/:/g, "");
  const morphRef = useRef<HTMLDivElement>(null);
  const [morph, setMorph] = useState<MorphMode>("idle");

  useEffect(() => {
    const root = morphRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMorph("static");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMorph("playing");
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

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

        <div
          ref={morphRef}
          dir="ltr"
          className="relative mx-auto w-full max-w-4xl select-none"
          aria-hidden="true"
        >
          <div className="bg-grid relative rounded-xl border border-line bg-surface p-5 sm:p-7">
            {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos) => (
              <span key={pos} className={`absolute ${pos} font-mono text-[13px] font-light text-ink3`}>
                +
              </span>
            ))}

            <div
              className={cn(
                "practice-morph relative aspect-[10/9] sm:aspect-[10/8]",
                morph === "playing" && "is-playing",
                morph === "static" && "is-static",
                morph === "idle" && "is-idle"
              )}
            >
              <Layer className="absolute inset-x-0 top-[4%]">
                <div className="relative grid">
                  <div className="practice-morph-stage practice-morph-sketch col-start-1 row-start-1">
                    <SketchStage filterId={`pg-sketch-${uid}`} />
                  </div>
                  <div className="practice-morph-stage practice-morph-wire col-start-1 row-start-1">
                    <WireframeStage />
                  </div>
                  <div className="practice-morph-stage practice-morph-product col-start-1 row-start-1">
                    <Dashboard gradientId={`pg-area-${uid}`} />
                  </div>
                </div>
              </Layer>

              <Layer className="practice-morph-floater practice-morph-chip absolute bottom-[16%] right-[2%] hidden w-[30%] sm:block">
                <DesignChip />
              </Layer>
              <Layer className="practice-morph-floater practice-morph-code absolute bottom-[2%] left-0 hidden w-[54%] sm:block">
                <CodeCard />
              </Layer>
              <Layer className="practice-morph-floater practice-morph-agent absolute -top-2 right-0 w-[46%] sm:top-[1%] sm:w-[42%]">
                <AgentCard />
              </Layer>
            </div>
          </div>

          <p className="mt-3 text-center font-mono text-[10px] tracking-[0.16em] text-ink3">{eco.caption}</p>
        </div>
      </div>
    </div>
  );
}

export default function Intro() {
  const { t } = useApp();

  return (
    <>
      <PracticeMorph />

      <section className="section-pad">
        <div className="wrap grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Reveal>
              <span className="kicker">{t.intro.kicker}</span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 text-[26px] font-extrabold leading-[1.25] tracking-tight sm:mt-5 sm:text-[30px] md:text-[40px] md:leading-[1.2]">
                {t.intro.title}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-4 text-[14px] leading-7 text-ink2 sm:mt-6 sm:text-[15px] sm:leading-[1.95]">{t.intro.p1}</p>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-3 text-[14px] leading-7 text-ink2 sm:mt-4 sm:text-[15px] sm:leading-[1.95]">{t.intro.p2}</p>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-5 rounded-sm border-s-[3px] border-hi bg-surface px-4 py-3 text-[14px] font-bold leading-7 sm:mt-7 sm:px-5 sm:py-4 sm:text-[15px] sm:leading-8">
                {t.intro.strong}
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="flex h-full flex-col justify-center">
              {t.intro.manifesto.map((line, i) => {
                const Icon = manifestoIcons[i];
                return (
                  <Reveal key={i} delay={i * 100}>
                    <div className="group flex items-center gap-4 border-b border-line py-4 transition-colors duration-300 first:border-t hover:border-hi/50 sm:gap-6 sm:py-7 md:gap-10 md:py-9">
                      <span className="font-mono text-[12px] font-semibold text-ink3 transition-colors duration-300 group-hover:text-hi sm:text-sm">
                        0{i + 1}
                      </span>
                      <span className="flex-1 text-[18px] font-black leading-snug tracking-tight sm:text-[24px] md:text-[36px] lg:text-[40px]">
                        {line}
                      </span>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-line text-ink2 transition-all duration-300 group-hover:border-hi group-hover:bg-hi group-hover:text-page sm:h-12 sm:w-12 md:h-14 md:w-14">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={1.8} />
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
