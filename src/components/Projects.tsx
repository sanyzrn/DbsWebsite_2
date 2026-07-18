import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Check, Database, FileSearch, FileText, Languages, Lock, Plus, Repeat2, Send, Sparkles, Wand2 } from "lucide-react";
import { useApp } from "../lib/app";
import { cn } from "../utils/cn";
import { DirArrow, Reveal, SectionHead } from "./ui";

type MockKind = "pulse" | "ai" | "keep" | "brain" | "chatbot" | "tools" | "hesabyar";

/* ------------------------------------------------------------------ */
/*  Screenshot shell                                                    */
/* ------------------------------------------------------------------ */

function Shot({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div dir="ltr" className={cn("relative aspect-[16/10] overflow-hidden bg-shot", className)}>
      {children}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent" aria-hidden="true" />
    </div>
  );
}

const row = (w: string, tone = "bg-shotup") => <span className={cn("block h-1.5 rounded-full", tone)} style={{ width: w }} />;

/* ------------------------------------------------------------------ */
/*  Mocks                                                               */
/* ------------------------------------------------------------------ */

function MockPulse() {
  return (
    <div className="absolute inset-4 flex overflow-hidden rounded-[10px] border border-shotline bg-shotpanel sm:inset-6">
      <div className="hidden w-[24%] border-e border-shotline p-3 sm:block">
        <div className="mb-4 flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-accent font-mono text-[9px] font-bold text-[#211a10]">P</span>
          {row("60%", "bg-shotup")}
        </div>
        {["55%", "42%", "48%", "38%", "45%"].map((w, i) => (
          <div key={i} className={cn("mb-1 flex items-center gap-1.5 rounded-[4px] px-1.5 py-1.5", i === 0 && "bg-shotup")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", i === 0 ? "bg-accent" : "bg-shotline")} />
            {row(w, i === 0 ? "bg-shotmut/60" : "bg-shotline")}
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">{row("70px", "bg-shotmut/60")}{row("44px")}</div>
          <span className="h-5 w-5 rounded-full border border-shotline bg-shotup" />
        </div>
        {/* pipeline */}
        <div className="flex items-center" dir="ltr">
          {[0, 1, 2, 3].map((i) => (
            <Fragment key={i}>
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full border-2", i < 2 ? "border-accent bg-accent" : i === 2 ? "pulse-dot border-steel bg-steel" : "border-shotline bg-shot")} />
              {i < 3 && <span className="relative h-0.5 flex-1 bg-shotline">{i < 1 && <span className="absolute inset-0 bg-accent" />}</span>}
            </Fragment>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {["text-accent", "text-sage", "text-steel"].map((c, i) => (
            <div key={i} className="rounded-[4px] border border-shotline bg-shot px-2 py-1.5">
              <span className={cn("font-mono text-[10px] font-bold", c)}>{["1,284", "98%", "4.7"][i]}</span>
              <span className="mt-1 block h-1 w-3/4 rounded-full bg-shotup" />
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-end gap-1 rounded-[4px] border border-shotline bg-shot p-2">
          {[38, 62, 48, 78, 55, 90, 66, 82, 58, 74].map((h, i) => (
            <span key={i} className={cn("flex-1 rounded-t-[2px]", i === 5 ? "bg-accent" : "bg-[#394047]")} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MockAI() {
  return (
    <div className="absolute inset-4 flex overflow-hidden rounded-[10px] border border-shotline bg-shotpanel sm:inset-6">
      <div className="hidden w-[32%] flex-col gap-1.5 border-e border-shotline p-2.5 sm:flex">
        <span className="mb-1 font-mono text-[8px] uppercase tracking-widest text-shotmut">providers</span>
        {["#BC9463", "#8FB0C0", "#A3B18A"].map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 rounded-[4px] border border-shotline bg-shot px-1.5 py-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: c }} />
            {row("46%", "bg-shotup")}
            <span className="ms-auto h-2 w-3.5 rounded-full bg-sage/70" />
          </div>
        ))}
        <span className="mb-1 mt-2 font-mono text-[8px] uppercase tracking-widest text-shotmut">quota</span>
        <div className="rounded-[4px] border border-shotline bg-shot p-1.5">
          <div className="h-1 overflow-hidden rounded-full bg-shotup"><div className="h-full w-[63%] bg-steel" /></div>
          <span className="mt-1 block font-mono text-[7px] text-shotmut">63% · tokens</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <div className="max-w-[78%] self-start rounded-[6px] rounded-ss-none border border-shotline border-s-2 border-s-accent bg-shotup p-2">
          <div className="mb-1 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-accent" />
            <span className="font-mono text-[7px] font-bold text-accent">agent</span>
          </div>
          {row("100%", "bg-shotmut/50")}{row("72%", "bg-shotmut/40")}
          <span className="mt-1.5 block">{row("55%", "bg-shotmut/30")}</span>
        </div>
        <div className="max-w-[62%] self-end rounded-[6px] rounded-se-none bg-accent/15 p-2">
          {row("100%", "bg-accent/50")}{row("60%", "bg-accent/35")}
        </div>
        <div className="flex gap-1 self-start px-1 py-0.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1 w-1 animate-pulse rounded-full bg-shotmut" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
        <div className="mt-auto flex items-center gap-1.5 rounded-[5px] border border-shotline bg-shot p-1.5">
          {row("58%", "bg-shotup")}
          <span className="ms-auto flex h-4.5 w-4.5 items-center justify-center rounded-[4px] bg-accent p-1">
            <Send className="h-2.5 w-2.5 text-[#211a10]" />
          </span>
        </div>
      </div>
    </div>
  );
}

function MockKeep() {
  return (
    <div className="absolute inset-4 overflow-hidden rounded-[10px] border border-shotline bg-shotpanel sm:inset-6">
      <div className="flex items-center gap-1.5 border-b border-shotline px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#3A4048]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#3A4048]" />
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="ms-auto flex items-center gap-1 rounded-[3px] border border-shotline px-1.5 py-0.5 font-mono text-[7px] text-sage">
          <Lock className="h-2 w-2" /> offline · encrypted
        </span>
      </div>
      <div className="flex h-[calc(100%-26px)]">
        <div className="hidden w-[22%] border-e border-shotline p-2 sm:block">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="mb-1 flex items-center gap-1 px-1 py-1">
              <span className={cn("h-1.5 w-1.5 rounded-[2px]", i === 0 ? "bg-accent" : "bg-shotline")} />
              {row("70%", "bg-shotline")}
            </div>
          ))}
        </div>
        <div className="w-[34%] border-e border-shotline p-2 sm:w-[30%]">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("mb-1.5 rounded-[4px] border p-1.5", i === 0 ? "border-accent/50 bg-shotup" : "border-shotline")}>
              {row("80%", i === 0 ? "bg-shotmut/60" : "bg-shotup")}
              <span className="mt-1 block">{row("50%", "bg-shotline")}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-1.5 p-2.5">
          {row("46%", "bg-shotmut/60")}
          {row("100%")}{row("88%")}{row("95%")}{row("60%")}
          <div className="mt-2 flex gap-1">
            <span className="rounded-[3px] bg-accent/15 px-1.5 py-0.5 font-mono text-[7px] text-accent">#ideas</span>
            <span className="rounded-[3px] bg-steel/15 px-1.5 py-0.5 font-mono text-[7px] text-steel">#work</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockBrain() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-4">
      <div className="hidden h-[86%] w-[26%] translate-y-3 rounded-[14px] border border-shotline bg-shotpanel/70 p-2 sm:block">
        <div className="space-y-1.5">
          {row("60%", "bg-shotmut/50")}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-[4px] border border-shotline p-1.5">
              <span className={cn("flex h-3 w-3 items-center justify-center rounded-[3px]", i < 2 ? "bg-sage/20 text-sage" : "border border-shotline")}>
                {i < 2 && <Check className="h-2 w-2" />}
              </span>
              {row("70%", "bg-shotup")}
            </div>
          ))}
        </div>
      </div>
      <div className="flex h-[92%] w-[38%] flex-col rounded-[16px] border border-shotline bg-shotpanel p-2.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] sm:w-[30%]">
        <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-shotline" />
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 44 44" className="h-11 w-11" aria-hidden="true">
            <circle cx="22" cy="22" r="17" fill="none" stroke="#242930" strokeWidth="5" />
            <circle cx="22" cy="22" r="17" fill="none" stroke="#A3B18A" strokeWidth="5" strokeLinecap="round" strokeDasharray="107" strokeDashoffset="27" transform="rotate(-90 22 22)" />
            <circle cx="22" cy="22" r="10" fill="none" stroke="#242930" strokeWidth="4" />
            <circle cx="22" cy="22" r="10" fill="none" stroke="#BC9463" strokeWidth="4" strokeLinecap="round" strokeDasharray="63" strokeDashoffset="16" transform="rotate(-90 22 22)" />
          </svg>
          <div className="flex-1 space-y-1">{row("80%", "bg-shotmut/50")}{row("55%")}</div>
        </div>
        <div className="mt-2.5 space-y-1.5">
          {[80, 55, 35].map((p, i) => (
            <div key={i} className="rounded-[4px] border border-shotline p-1.5">
              <div className="mb-1 flex justify-between">{row("52%", "bg-shotup")}<span className="font-mono text-[7px] text-shotmut">{p}%</span></div>
              <div className="h-1 overflow-hidden rounded-full bg-shotup">
                <div className={cn("h-full rounded-full", ["bg-sage", "bg-accent", "bg-steel"][i])} style={{ width: `${p}%` }} />
              </div>
            </div>
          ))}
        </div>
        <span className="mt-auto self-center rounded-[3px] border border-shotline px-1.5 py-0.5 font-mono text-[7px] text-shotmut">Kotlin · Compose</span>
      </div>
    </div>
  );
}

function MockChatBot() {
  return (
    <div className="absolute inset-4 sm:inset-6">
      <div className="h-full overflow-hidden rounded-[10px] border border-shotline bg-shotpanel">
        <div className="flex items-center gap-1.5 border-b border-shotline px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3A4048]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#3A4048]" />
          <span className="ms-2 h-2 w-24 rounded-full bg-shot" />
        </div>
        <div className="space-y-2 p-3">
          {row("52%", "bg-shotmut/50")}
          {row("38%")}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-[4px] border border-shotline p-1.5">{row("70%")}<span className="mt-1 block">{row("45%", "bg-shotline")}</span></div>
            ))}
          </div>
        </div>
      </div>
      {/* chat widget */}
      <div className="absolute bottom-2.5 end-2.5 w-[52%] overflow-hidden rounded-[10px] border border-shotline bg-shotup shadow-[0_20px_50px_-14px_rgba(0,0,0,0.65)]">
        <div className="flex items-center gap-1.5 border-b border-shotline bg-shotpanel px-2 py-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent"><Sparkles className="h-2 w-2 text-[#211a10]" /></span>
          <span className="font-mono text-[8px] font-bold text-shotink">DbsChatBot</span>
          <span className="pulse-dot ms-auto h-1.5 w-1.5 rounded-full bg-sage" />
        </div>
        <div className="space-y-1.5 p-2">
          <div className="max-w-[82%] rounded-[5px] rounded-ss-none bg-shot p-1.5">{row("100%", "bg-shotmut/50")}{row("65%", "bg-shotmut/35")}</div>
          <div className="ms-auto max-w-[60%] rounded-[5px] rounded-se-none bg-accent/20 p-1.5">{row("90%", "bg-accent/50")}</div>
          <div className="flex items-center gap-1 rounded-[4px] border border-shotline bg-shot p-1">
            {row("55%", "bg-shotup")}
            <Send className="ms-auto h-2.5 w-2.5 text-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MockTools() {
  const tools = [
    { icon: FileText, label: "docs" },
    { icon: Languages, label: "translate" },
    { icon: FileSearch, label: "extract" },
    { icon: Wand2, label: "generate" },
    { icon: Repeat2, label: "automate" },
    { icon: Database, label: "pipeline" },
  ];
  return (
    <div className="absolute inset-4 grid grid-cols-3 content-center gap-2 sm:inset-6 sm:gap-2.5">
      {tools.map((tool, i) => (
        <div
          key={tool.label}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-[8px] border bg-shotpanel px-1 py-3 sm:py-4",
            i === 3 ? "border-accent/60" : "border-shotline"
          )}
        >
          <tool.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", i === 3 ? "text-accent" : "text-shotmut")} strokeWidth={1.8} />
          <span className="font-mono text-[7.5px] uppercase tracking-wider text-shotmut">{tool.label}</span>
          {i === 3 ? (
            <span className="h-1 w-3/4 overflow-hidden rounded-full bg-shotup"><span className="block h-full w-[72%] rounded-full bg-accent" /></span>
          ) : (
            <span className="h-1 w-1/2 rounded-full bg-shotline" />
          )}
        </div>
      ))}
    </div>
  );
}

function MockHesabyar() {
  return (
    <div className="absolute inset-4 flex flex-col gap-2 overflow-hidden rounded-[10px] border border-shotline bg-shotpanel p-2.5 sm:inset-6" dir="rtl" style={{ fontFamily: "Vazirmatn, sans-serif" }}>
      <div className="flex items-center gap-1.5">
        {["مهر", "آبان", "آذر"].map((m, i) => (
          <span key={m} className={cn("rounded-[4px] px-2 py-0.5 text-[9px] font-bold", i === 1 ? "bg-accent text-[#211a10]" : "border border-shotline text-shotmut")}>
            {m}
          </span>
        ))}
        <span className="ms-auto h-4 w-4 rounded-full border border-shotline bg-shotup" />
      </div>
      <div className="rounded-[6px] border border-shotline bg-shot p-2.5">
        <span className="text-[8px] text-shotmut">موجودی کل</span>
        <div className="mt-0.5 font-mono text-[15px] font-bold text-accent" dir="ltr">۱۲٬۴۸۰٬۰۰۰ <span className="text-[9px] text-shotmut">تومان</span></div>
      </div>
      <div className="flex-1 space-y-1.5">
        {[
          { p: 80, c: "bg-sage" },
          { p: 45, c: "bg-accent" },
          { p: 20, c: "bg-steel" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 rounded-[5px] border border-shotline p-1.5">
            <span className="h-2 w-2 rounded-full bg-shotline" />
            <span className="h-1.5 w-14 rounded-full bg-shotup" />
            <div className="ms-auto flex w-[38%] items-center gap-1.5">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-shotup"><div className={cn("h-full rounded-full", item.c)} style={{ width: `${item.p}%` }} /></div>
              <span className="font-mono text-[7px] text-shotmut" dir="ltr">{item.p}%</span>
            </div>
          </div>
        ))}
      </div>
      <span className="absolute bottom-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[#211a10] shadow-lg">
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </span>
    </div>
  );
}

const mocks: Record<MockKind, () => ReactNode> = {
  pulse: MockPulse,
  ai: MockAI,
  keep: MockKeep,
  brain: MockBrain,
  chatbot: MockChatBot,
  tools: MockTools,
  hesabyar: MockHesabyar,
};

/* ------------------------------------------------------------------ */
/*  Card pieces                                                         */
/* ------------------------------------------------------------------ */

function Meta({ label, items, mono }: { label: string; items: string[]; mono?: boolean }) {
  return (
    <div>
      <span className="mb-2.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink3">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className={cn("chip", mono && "chip-mono")}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                             */
/* ------------------------------------------------------------------ */

type ProjectItem = (typeof import("../lib/i18n").dictionaries.en.projects.items)[number];

export default function Projects() {
  const { t } = useApp();
  const [filter, setFilter] = useState<string>("all");
  const [active, setActive] = useState<ProjectItem | null>(null);

  const filtered = t.projects.items.filter((p) => filter === "all" || p.tags.includes(filter));
  const source = filtered.length ? filtered : t.projects.items;
  const [featured, ...grid] = source;

  const open = (p: ProjectItem) => {
    setActive(p);
    history.replaceState(null, "", `#project/${p.id}`);
  };

  const close = () => {
    setActive(null);
    if (location.hash.startsWith("#project/")) history.replaceState(null, "", "#projects");
  };

  useEffect(() => {
    const match = location.hash.match(/^#project\/([\w-]+)/);
    if (match) {
      const found = t.projects.items.find((p) => p.id === match[1]);
      if (found) setActive(found);
    }
  }, [t.projects.items]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActive(null);
        if (location.hash.startsWith("#project/")) history.replaceState(null, "", "#projects");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section id="projects" className="section-pad border-t border-line">
      <div className="wrap">
        <SectionHead kicker={t.projects.kicker} title={t.projects.title} lead={t.projects.lead} />

        {/* filter chips */}
        <div className="mt-10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn("chip chip-hover", filter === "all" && "border-hi text-hi")}
          >
            {t.projects.filterAll}
          </button>
          {t.projects.filters.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setFilter(tag)}
              className={cn("chip chip-mono chip-hover", filter === tag && "border-hi text-hi")}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* ------------------------------ featured ------------------------------ */}
        <Reveal className="mt-10">
          <article className="group grid overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-500 hover:border-hi/60 lg:grid-cols-5">
            <button type="button" onClick={() => open(featured)} className="relative overflow-hidden text-start lg:col-span-3">
              <Shot className="h-full min-h-[240px] transition-transform duration-700 group-hover:scale-[1.015] lg:aspect-auto">
                {mocks[featured.mock as MockKind]()}
              </Shot>
              {filter === "all" && (
                <span className="absolute start-4 top-4 rounded-xs bg-shot/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-accent backdrop-blur">
                  {t.projects.featured}
                </span>
              )}
            </button>
            <div className="flex flex-col gap-6 p-7 md:p-10 lg:col-span-2">
              <div>
                <h3 className="text-[28px] font-black tracking-tight md:text-[32px]" dir={featured.id === "hesabyar" ? undefined : "ltr"}>
                  {featured.name}
                </h3>
                <p className="mt-2 text-[15px] font-bold leading-8 text-hi">{featured.subtitle}</p>
                <p className="mt-4 text-[14px] leading-[1.95] text-ink2">{featured.desc}</p>
              </div>
              <Meta label={t.projects.roleLabel} items={featured.role} />
              <Meta label={t.projects.techLabel} items={featured.tech} mono />
              <button
                type="button"
                onClick={() => open(featured)}
                className="mt-auto inline-flex items-center gap-2 border-t border-line pt-6 text-[13px] font-bold text-ink2 transition-colors hover:text-hi"
              >
                {t.projects.view}
                <DirArrow className="h-4 w-4" />
              </button>
            </div>
          </article>
        </Reveal>

        {/* ------------------------------ grid ------------------------------ */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {grid.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 90} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-all duration-500 hover:-translate-y-1.5 hover:border-hi/60">
                <button type="button" onClick={() => open(p)} className="overflow-hidden text-start">
                  <Shot className="transition-transform duration-700 group-hover:scale-[1.03]">
                    {mocks[p.mock as MockKind]()}
                  </Shot>
                </button>
                <div className="flex flex-1 flex-col gap-5 p-6">
                  <div>
                    <h3 className="text-[21px] font-extrabold tracking-tight" dir={p.id === "hesabyar" ? undefined : "ltr"}>
                      {p.name}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] font-bold leading-7 text-hi">{p.subtitle}</p>
                    <p className="mt-3 text-[13px] leading-[1.9] text-ink2">{p.desc}</p>
                  </div>

                  {"caps" in p && p.caps && (
                    <div>
                      <span className="mb-2.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink3">
                        {t.projects.capsLabel}
                      </span>
                      <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
                        {p.caps.map((c) => (
                          <li key={c} className="flex items-center gap-1.5 text-[11.5px] font-medium leading-5 text-ink2">
                            <Check className="h-3.5 w-3.5 shrink-0 text-sage" strokeWidth={2.5} />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-auto space-y-5 border-t border-line pt-5">
                    <Meta label={t.projects.roleLabel} items={p.role} />
                    <Meta label={t.projects.techLabel} items={p.tech} mono />
                    <button
                      type="button"
                      onClick={() => open(p)}
                      className="inline-flex items-center gap-2 text-[12.5px] font-bold text-ink2 transition-colors hover:text-hi"
                    >
                      {t.projects.view}
                      <DirArrow className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {/* in-app case study panel */}
      {active && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/45 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={close} role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-dialog-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-lg border border-line bg-page shadow-2xl sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-line bg-page/95 px-5 py-4 backdrop-blur">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink3">{active.tags.join(" · ")}</p>
                <h3 id="project-dialog-title" className="mt-1 text-[22px] font-black tracking-tight" dir={active.id === "hesabyar" ? undefined : "ltr"}>
                  {active.name}
                </h3>
              </div>
              <button type="button" onClick={close} className="rounded-sm border border-line px-3 py-1.5 text-[12px] font-bold hover:border-hi hover:text-hi">
                {t.projects.close}
              </button>
            </div>
            <div className="p-5 md:p-8">
              <Shot className="rounded-md border border-line">
                {mocks[active.mock as MockKind]()}
              </Shot>
              <p className="mt-6 text-[16px] font-bold leading-8 text-hi">{active.subtitle}</p>
              <p className="mt-3 text-[14.5px] leading-[1.95] text-ink2">{active.desc}</p>
              {"caps" in active && active.caps && (
                <div className="mt-6">
                  <span className="mb-2.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink3">
                    {t.projects.capsLabel}
                  </span>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {active.caps.map((c) => (
                      <li key={c} className="flex items-center gap-2 text-[13px] font-medium text-ink2">
                        <Check className="h-4 w-4 shrink-0 text-sage" strokeWidth={2.5} />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Meta label={t.projects.roleLabel} items={active.role} />
                <Meta label={t.projects.techLabel} items={active.tech} mono />
              </div>
              <a href="#contact" onClick={close} className="btn btn-primary mt-8 w-full sm:w-auto">
                {t.projects.discuss}
                <DirArrow className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
