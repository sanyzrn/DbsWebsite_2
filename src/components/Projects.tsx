import { Fragment, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Database, FileSearch, FileText, Languages, Lock, Plus, Repeat2, Send, Sparkles, Wand2 } from "lucide-react";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";
import { cn } from "../utils/cn";
import { DirArrow, Reveal, SectionHead, SnapCarousel } from "./ui";

type MockKind = "pulse" | "ai" | "keep" | "brain" | "chatbot" | "tools" | "hesabyar" | "concept";

/* ------------------------------------------------------------------ */
/*  Screenshot shell                                                    */
/* ------------------------------------------------------------------ */

function Shot({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div dir="ltr" className={cn("relative aspect-[16/10] overflow-hidden bg-shot", className)} aria-hidden="true">
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

function MockConcept() {
  return (
    <div className="absolute inset-4 flex flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-shotline bg-shotpanel/80 sm:inset-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-shotmut">concept</span>
      <span className="h-px w-16 bg-shotline" />
      <span className="max-w-[70%] text-center font-mono text-[9px] leading-4 text-shotmut">placeholder exploration</span>
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
  concept: MockConcept,
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

export type ProjectItem = import("../lib/projects").LocalizedProject;

function StatusBadge({ status }: { status?: "production" | "concept" }) {
  const { t } = useApp();
  if (status === "concept") {
    return (
      <span className="shrink-0 rounded-xs border border-dashed border-ink3/50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-ink3">
        {t.projects.statusConcept}
      </span>
    );
  }
  return null;
}

function ProjectShot({ project, className }: { project: ProjectItem; className?: string }) {
  const Mock = mocks[project.mock as MockKind] ?? MockConcept;
  return (
    <Shot className={className}>
      <Mock />
    </Shot>
  );
}

/** Compact card used by the home teaser carousel (mobile SnapCarousel only). */
function ProjectCard({
  project,
  detailTo,
  viewLabel,
  featuredLabel,
  previewAria,
}: {
  project: ProjectItem;
  detailTo: string;
  viewLabel: string;
  featuredLabel: string;
  previewAria: string;
}) {
  return (
    <article
      className={cn(
        // min-h safety net so short concept copy still matches taller cards in the carousel.
        "group flex h-full min-h-[440px] w-full flex-col overflow-hidden rounded-lg border bg-surface",
        project.status === "concept" ? "border-dashed border-line2" : "border-line"
      )}
    >
      <Link to={detailTo} className="relative overflow-hidden text-start" aria-label={previewAria}>
        <ProjectShot project={project} />
        {/* Badges overlay the shot so optional featured/concept chips don't change body height. */}
        {(project.featured || project.status === "concept") && (
          <span className="absolute start-3 top-3 flex flex-wrap gap-1.5" aria-hidden="true">
            {project.featured && project.status !== "concept" ? (
              <span className="rounded-xs border border-hi/40 bg-shot/90 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-accent backdrop-blur">
                {featuredLabel}
              </span>
            ) : null}
            <StatusBadge status={project.status} />
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3
          className="line-clamp-2 text-[20px] font-extrabold tracking-tight"
          dir={project.id === "hesabyar" ? undefined : "ltr"}
        >
          {project.name}
        </h3>
        <p className="line-clamp-2 text-[13px] font-bold leading-6 text-hi">{project.subtitle}</p>
        <p className="line-clamp-3 text-[13px] leading-7 text-ink2">{project.desc}</p>
        <div className="mt-auto border-t border-line pt-4" data-testid="project-card-footer">
          {project.tags.length > 0 ? (
            <p className="mb-3 line-clamp-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink3">
              {project.tags.join(" · ")}
            </p>
          ) : null}
          <Link to={detailTo} className="inline-flex items-center gap-2 text-[12.5px] font-bold text-ink2">
            {viewLabel}
            <DirArrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Home-page teaser: strongest published production picks. */
const TEASER_IDS = ["dbspulse", "dbsbrain", "dbschatbot", "dbskeep"];

type ProjectsProps = {
  mode?: "teaser" | "full";
};

export default function Projects({ mode = "full" }: ProjectsProps) {
  const { t, lang } = useApp();
  const [filter, setFilter] = useState("all");

  const items = useMemo(() => {
    if (mode === "teaser") {
      return TEASER_IDS.map((id) => t.projects.items.find((p) => p.id === id)).filter(Boolean) as ProjectItem[];
    }
    return t.projects.items;
  }, [mode, t.projects.items]);

  const filtered = items.filter((p) => filter === "all" || p.tags.includes(filter));
  const source = filtered.length ? filtered : items;
  const [featured, ...grid] = source;

  const detailTo = (id: string) => localePath(lang, `/projects/${id}`);
  const isTeaser = mode === "teaser";
  const previewLabel = (name: string) => t.projects.previewAria.replace("{name}", name);

  return (
    <section id="projects" className="section-pad border-t border-line">
      <div className="wrap">
        <SectionHead
          kicker={mode === "full" ? t.projects.pageKicker : t.projects.kicker}
          title={mode === "full" ? t.projects.pageTitle : t.projects.title}
          lead={mode === "full" ? t.projects.pageLead : t.projects.lead}
        />

        {mode === "full" && (
          <div className="mt-7 flex flex-wrap gap-2 sm:mt-10">
            <button type="button" onClick={() => setFilter("all")} className={cn("chip chip-hover", filter === "all" && "border-hi text-hi")}>
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
        )}

        {/* Mobile carousel — home teaser only */}
        {isTeaser && (
          <div data-testid="projects-carousel">
            <SnapCarousel className="mt-7 md:hidden" label={t.projects.title} itemClassName="flex h-full" key={`teaser-${filter}`}>
              {source.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  detailTo={detailTo(p.slug)}
                  viewLabel={t.projects.view}
                  featuredLabel={t.projects.featured}
                  previewAria={previewLabel(p.name)}
                />
              ))}
            </SnapCarousel>
          </div>
        )}

        {/* Desktop grid for teaser; all-viewport grid for full /projects page */}
        <div
          className={cn("mt-8", isTeaser && "hidden md:block")}
          data-testid="projects-grid"
        >
          {featured && (
            <Reveal>
              <article
                className={cn(
                  "group grid overflow-hidden rounded-lg border bg-surface transition-colors duration-500 hover:border-hi/60 lg:grid-cols-5",
                  featured.status === "concept" ? "border-dashed border-line2" : "border-line"
                )}
              >
                <Link
                  to={detailTo(featured.slug)}
                  className="relative overflow-hidden text-start lg:col-span-3"
                  aria-label={previewLabel(featured.name)}
                >
                  <ProjectShot project={featured} className="h-full min-h-[240px] transition-transform duration-700 group-hover:scale-[1.015] lg:aspect-auto" />
                  {featured.featured && featured.status !== "concept" && (
                    <span className="absolute start-4 top-4 rounded-xs bg-shot/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-accent backdrop-blur" aria-hidden="true">
                      {t.projects.featured}
                    </span>
                  )}
                </Link>
                <div className="flex flex-col gap-6 p-7 md:p-10 lg:col-span-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-[28px] font-black tracking-tight md:text-[32px]" dir={featured.id === "hesabyar" ? undefined : "ltr"}>
                        {featured.name}
                      </h3>
                      <StatusBadge status={featured.status} />
                    </div>
                    <p className="mt-2 text-[15px] font-bold leading-8 text-hi">{featured.subtitle}</p>
                    <p className="mt-4 text-[14px] leading-[1.95] text-ink2">{featured.desc}</p>
                  </div>
                  <Meta label={t.projects.roleLabel} items={featured.role} />
                  <Meta label={t.projects.techLabel} items={featured.tech} mono />
                  <Link
                    to={detailTo(featured.slug)}
                    className="mt-auto inline-flex items-center gap-2 border-t border-line pt-6 text-[13px] font-bold text-ink2 transition-colors hover:text-hi"
                  >
                    {t.projects.view}
                    <DirArrow className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            </Reveal>
          )}

          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {grid.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 90} className="h-full">
                <article
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-lg border bg-surface transition-all duration-500 hover:-translate-y-1.5 hover:border-hi/60",
                    p.status === "concept" ? "border-dashed border-line2" : "border-line"
                  )}
                >
                  <Link to={detailTo(p.slug)} className="overflow-hidden text-start" aria-label={previewLabel(p.name)}>
                    <ProjectShot project={p} className="transition-transform duration-700 group-hover:scale-[1.03]" />
                  </Link>
                  <div className="flex flex-1 flex-col gap-5 p-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[21px] font-extrabold tracking-tight" dir={p.id === "hesabyar" ? undefined : "ltr"}>
                          {p.name}
                        </h3>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="mt-1.5 text-[13.5px] font-bold leading-7 text-hi">{p.subtitle}</p>
                      <p className="mt-3 text-[13px] leading-[1.9] text-ink2">{p.desc}</p>
                    </div>

                    {p.caps && p.caps.length > 0 && (
                      <div>
                        <span className="mb-2.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink3">{t.projects.capsLabel}</span>
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
                      <Link to={detailTo(p.slug)} className="inline-flex items-center gap-2 text-[12.5px] font-bold text-ink2 transition-colors hover:text-hi">
                        {t.projects.view}
                        <DirArrow className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        {isTeaser && (
          <div className="mt-10 flex justify-center">
            <Link to={localePath(lang, "/projects")} className="btn btn-primary h-12 px-7 text-[14px]">
              {t.projects.seeAll}
              <DirArrow className="h-[18px] w-[18px]" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectMetaRow({ project }: { project: ProjectItem }) {
  const { t } = useApp();
  const items: { key: string; label: string; value: ReactNode }[] = [];

  if (project.year) {
    items.push({ key: "year", label: t.projects.metaYear, value: project.year });
  }
  if (project.durationMonths != null) {
    items.push({
      key: "duration",
      label: t.projects.metaDuration,
      value: t.projects.metaDurationValue.replace("{n}", String(project.durationMonths)),
    });
  }
  if (project.teamSize) {
    items.push({ key: "team", label: t.projects.metaTeam, value: project.teamSize });
  }
  if (project.clientType) {
    items.push({ key: "client", label: t.projects.metaClient, value: project.clientType });
  }
  if (project.links && project.links.length > 0) {
    items.push({
      key: "links",
      label: t.projects.metaLinks,
      value: (
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-hi underline-offset-2 transition-colors hover:underline"
            >
              {link.label}
            </a>
          ))}
        </span>
      ),
    });
  }

  if (items.length === 0) return null;

  return (
    <dl className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1.5 text-[12px] leading-5 text-ink2">
      {items.map((item) => (
        <div key={item.key} className="inline-flex min-w-0 items-baseline gap-1.5">
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink3">{item.label}</dt>
          <dd className="min-w-0 font-medium text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProjectDetailView({ project }: { project: ProjectItem }) {
  const { t, lang } = useApp();
  return (
    <div className="wrap section-pad">
      <Link to={localePath(lang, "/projects")} className="inline-flex items-center gap-2 text-[13px] font-bold text-ink2 transition-colors hover:text-hi">
        <DirArrow className="h-4 w-4 rotate-180" />
        {t.projects.pageTitle}
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="text-[32px] font-black tracking-tight md:text-[40px]" dir={project.id === "hesabyar" ? undefined : "ltr"}>
          {project.name}
        </h1>
        <StatusBadge status={project.status} />
      </div>
      <ProjectMetaRow project={project} />
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">{project.tags.join(" · ")}</p>
      <div className="mt-8 overflow-hidden rounded-lg border border-line">
        <ProjectShot project={project} />
      </div>
      <p className="mt-8 text-[18px] font-bold leading-8 text-hi md:text-[20px]">{project.subtitle}</p>
      <p className="mt-4 max-w-3xl text-[15px] leading-[1.95] text-ink2">{project.desc}</p>
      {(project.problem || project.approach || project.result) && (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {project.problem ? (
            <div>
              <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink3">{t.projects.problemLabel}</span>
              <p className="text-[14px] leading-7 text-ink2">{project.problem}</p>
            </div>
          ) : null}
          {project.approach ? (
            <div>
              <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink3">{t.projects.approachLabel}</span>
              <p className="text-[14px] leading-7 text-ink2">{project.approach}</p>
            </div>
          ) : null}
          {project.result ? (
            <div>
              <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink3">{t.projects.resultLabel}</span>
              <p className="text-[14px] leading-7 text-ink2">{project.result}</p>
            </div>
          ) : null}
        </div>
      )}
      {project.caps && project.caps.length > 0 && (
        <div className="mt-8">
          <span className="mb-2.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink3">{t.projects.capsLabel}</span>
          <ul className="grid gap-2 sm:grid-cols-2">
            {project.caps.map((c) => (
              <li key={c} className="flex items-center gap-2 text-[13px] font-medium text-ink2">
                <Check className="h-4 w-4 shrink-0 text-sage" strokeWidth={2.5} />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Meta label={t.projects.roleLabel} items={project.role} />
        <Meta label={t.projects.techLabel} items={project.tech} mono />
      </div>
      <Link to={`${localePath(lang, "/contact")}`} className="btn btn-primary mt-10 w-full sm:w-auto">
        {t.projects.discuss}
        <DirArrow className="h-4 w-4" />
      </Link>
    </div>
  );
}
