import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { Award, Boxes, Sparkles, Waypoints } from "lucide-react";
import { useApp } from "../lib/app";
import { DirArrow } from "./ui";

/* ------------------------------------------------------------------ */
/*  Parallax layer                                                      */
/* ------------------------------------------------------------------ */

function Layer({ depth, className, children }: { depth: number; className?: string; children: ReactNode }) {
  return (
    <div
      className={className}
      style={
        {
          transform: `translate3d(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth * 0.8}px), 0)`,
          transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard window (product fragment)                                 */
/* ------------------------------------------------------------------ */

const chartPath =
  "M0,72 L26,64 L52,68 L78,50 L104,55 L130,40 L156,46 L182,30 L208,36 L234,20 L260,27 L286,14 L300,18";

function Dashboard() {
  const bars = [42, 66, 50, 80, 58, 92, 70];
  return (
    <div className="overflow-hidden rounded-md border border-shotline bg-shotpanel shadow-[0_36px_90px_-24px_rgba(15,16,18,0.55)]">
      {/* window bar */}
      <div className="flex items-center gap-2 border-b border-shotline px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#3A4048]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3A4048]" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        <span className="ms-3 hidden rounded-xs border border-shotline bg-shot px-3 py-1 font-mono text-[9px] tracking-wider text-shotmut sm:block">
          dbspulse.app/overview
        </span>
      </div>
      <div className="flex">
        {/* sidebar */}
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
        {/* main */}
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
          {/* KPI chips */}
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
          {/* chart */}
          <div className="rounded-xs border border-shotline bg-shot p-2.5">
            <svg viewBox="0 0 300 92" className="h-16 w-full sm:h-[74px]" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#BC9463" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#BC9463" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[20, 44, 68].map((y) => (
                <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#2F353D" strokeWidth="1" strokeDasharray="3 5" />
              ))}
              <path d={`${chartPath} L300,92 L0,92 Z`} fill="url(#heroArea)" stroke="none" />
              <path d={chartPath} fill="none" stroke="#BC9463" strokeWidth="2" strokeLinecap="round" />
              <circle cx="234" cy="20" r="3.5" fill="#BC9463" stroke="#131518" strokeWidth="2" />
            </svg>
          </div>
          {/* bottom bars */}
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

/* ------------------------------------------------------------------ */
/*  Hero                                                                */
/* ------------------------------------------------------------------ */

export default function Hero() {
  const { t } = useApp();
  const canvasRef = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = canvasRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const onLeave = () => {
    const el = canvasRef.current;
    if (!el) return;
    el.style.setProperty("--px", "0");
    el.style.setProperty("--py", "0");
  };

  const statIcons = [Award, Boxes, Waypoints];

  return (
    <section id="top" className="relative overflow-hidden pt-[130px] pb-16 md:pt-[168px] md:pb-20">
      {/* backdrop grid */}
      <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-40" aria-hidden="true" />

      <div className="wrap relative grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
        {/* Copy */}
        <div className="lg:col-span-6">
          <div className="hero-in" style={{ animationDelay: "60ms" }}>
            <span className="chip chip-mono border-line2 text-ink2">
              <Sparkles className="h-3.5 w-3.5 text-hi" strokeWidth={2.2} />
              {t.hero.badge}
            </span>
          </div>

          <h1 className="mt-7 text-[40px] font-black leading-[1.15] tracking-tight sm:text-[52px] lg:text-[56px] xl:text-[62px] xl:leading-[1.12]">
            <span className="hero-in block" style={{ animationDelay: "140ms" }}>
              {t.hero.titleA}
            </span>
            <span className="hero-in block" style={{ animationDelay: "240ms" }}>
              {t.hero.titleB.split(t.hero.titleAccent)[0]}
              <span className="relative inline-block text-hi">
                {t.hero.titleAccent}
                <svg className="absolute -bottom-1.5 start-0 w-full" viewBox="0 0 200 9" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2,7 C60,2 140,2 198,6" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
                </svg>
              </span>
              {t.hero.titleB.split(t.hero.titleAccent)[1] ?? ""}
            </span>
          </h1>

          <p className="hero-in mt-7 max-w-xl text-[15px] leading-8 text-ink2 md:text-base md:leading-[1.95]" style={{ animationDelay: "340ms" }}>
            {t.hero.body}
          </p>
          <p className="hero-in mt-4 max-w-xl text-[15px] font-semibold leading-8 text-ink md:text-base md:leading-[1.95]" style={{ animationDelay: "420ms" }}>
            {t.hero.body2}
          </p>

          <div className="hero-in mt-9 flex flex-wrap items-center gap-3.5" style={{ animationDelay: "500ms" }}>
            <a href="#projects" className="btn btn-primary">
              {t.hero.ctaPrimary}
              <DirArrow className="h-[18px] w-[18px]" />
            </a>
            <a href="#about" className="btn btn-ghost">
              {t.hero.ctaSecondary}
            </a>
          </div>

          {/* stats */}
          <div className="hero-in mt-12 grid grid-cols-3 gap-5 border-t border-line pt-8 sm:gap-8" style={{ animationDelay: "600ms" }}>
            {t.hero.stats.map((s, i) => {
              const Icon = statIcons[i];
              return (
                <div key={i} className="group">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-sm border border-line text-hi transition-colors duration-300 group-hover:border-hi">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  </div>
                  <div className="text-[22px] font-black leading-none tracking-tight md:text-[26px]">{s.value}</div>
                  <div className="mt-2 text-[11.5px] font-medium leading-5 text-ink2">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product canvas */}
        <div className="lg:col-span-6">
          <div
            ref={canvasRef}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            dir="ltr"
            className="hero-in relative mx-auto max-w-[560px] select-none"
            style={{ animationDelay: "380ms" }}
            aria-hidden="true"
          >
            {/* blueprint base */}
            <div className="bg-grid relative rounded-xl border border-line bg-surface p-5 sm:p-7">
              {/* corner marks */}
              {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos) => (
                <span key={pos} className={`absolute ${pos} font-mono text-[13px] font-light text-ink3`}>
                  +
                </span>
              ))}

              <div className="relative aspect-[10/9] sm:aspect-[10/8]">
                {/* dashboard */}
                <Layer depth={10} className="absolute inset-x-0 top-[4%]">
                  <Dashboard />
                </Layer>

                {/* code fragment */}
                <Layer depth={22} className="absolute bottom-[2%] left-0 hidden w-[54%] sm:block">
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
                </Layer>

                {/* AI agent card */}
                <Layer depth={30} className="absolute -top-2 right-0 w-[46%] sm:top-[1%] sm:w-[42%]">
                  <div className="drift rounded-md border border-shotline bg-shotpanel p-3.5 shadow-[0_24px_60px_-18px_rgba(15,16,18,0.5)]">
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
                      {[["92%", "bg-sage"], ["68%", "bg-steel"]].map(([w, c], i) => (
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
                </Layer>

                {/* design chip */}
                <Layer depth={18} className="absolute bottom-[16%] right-[2%] hidden w-[30%] sm:block">
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
                </Layer>
              </div>
            </div>

            {/* caption */}
            <div className="mt-4 flex items-center justify-between font-mono text-[10px] tracking-wider text-ink3">
              <span>{t.hero.canvasFig}</span>
              <span className="text-hi">{t.hero.canvasCaption}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
