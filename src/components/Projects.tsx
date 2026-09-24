import { Fragment, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Database, FileSearch, FileText, Languages, Lock, Plus, Repeat2, Send, Sparkles, Wand2 } from "lucide-react";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";
import { cn } from "../utils/cn";
import { Breadcrumbs } from "./Breadcrumbs";
import { CropMarks, SectionHead, Slider } from "./ui";

type MockKind = "pulse" | "ai" | "keep" | "brain" | "chatbot" | "tools" | "hesabyar" | "patient" | "concept";

/* ------------------------------------------------------------------ */
/*  Screenshot shell                                                    */
/* ------------------------------------------------------------------ */

/**
 * Mock UIs are drawn at a small fixed scale; the shot is a size container and
 * the canvas zooms up in steps so the mock keeps its proportions in large frames.
 */
function Shot({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div dir="ltr" className={cn("shot absolute inset-0 overflow-hidden bg-shot", className)} aria-hidden="true">
      <div className="shot-canvas">{children}</div>
    </div>
  );
}

/** Map mock bar widths to Tailwind classes — no inline style= (CSP). */
const W: Record<string, string> = {
  "38%": "w-[38%]",
  "42%": "w-[42%]",
  "44px": "w-[44px]",
  "45%": "w-[45%]",
  "46%": "w-[46%]",
  "48%": "w-[48%]",
  "50%": "w-1/2",
  "52%": "w-[52%]",
  "55%": "w-[55%]",
  "58%": "w-[58%]",
  "60%": "w-[60%]",
  "65%": "w-[65%]",
  "70%": "w-[70%]",
  "70px": "w-[70px]",
  "72%": "w-[72%]",
  "80%": "w-4/5",
  "88%": "w-[88%]",
  "90%": "w-[90%]",
  "95%": "w-[95%]",
  "100%": "w-full",
};
const row = (w: string, tone = "bg-shotup") => (
  <span className={cn("block h-1.5 rounded-full", tone, W[w] ?? "w-1/2")} />
);

/* ------------------------------------------------------------------ */
/*  Mocks                                                               */
/* ------------------------------------------------------------------ */

function MockPulse() {
  return (
    <div className="absolute inset-4 flex overflow-hidden rounded-[10px] border border-shotline bg-shotpanel sm:inset-6">
      <div className="hidden w-[24%] border-e border-shotline p-3 sm:block">
        <div className="mb-4 flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-shotaccent font-mono text-[9px] font-bold text-shot">P</span>
          {row("60%", "bg-shotup")}
        </div>
        {["55%", "42%", "48%", "38%", "45%"].map((w, i) => (
          <div key={i} className={cn("mb-1 flex items-center gap-1.5 rounded-[4px] px-1.5 py-1.5", i === 0 && "bg-shotup")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", i === 0 ? "bg-shotaccent" : "bg-shotline")} />
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
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full border-2", i < 2 ? "border-shotaccent bg-shotaccent" : i === 2 ? "pulse-dot border-steel bg-steel" : "border-shotline bg-shot")} />
              {i < 3 && <span className="relative h-0.5 flex-1 bg-shotline">{i < 1 && <span className="absolute inset-0 bg-shotaccent" />}</span>}
            </Fragment>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {["text-shotaccent", "text-sage", "text-steel"].map((c, i) => (
            <div key={i} className="rounded-[4px] border border-shotline bg-shot px-2 py-1.5">
              <span className={cn("font-mono text-[10px] font-bold", c)}>{["1,284", "98%", "4.7"][i]}</span>
              <span className="mt-1 block h-1 w-3/4 rounded-full bg-shotup" />
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-end gap-1 rounded-[4px] border border-shotline bg-shot p-2">
          {["h-[38%]", "h-[62%]", "h-[48%]", "h-[78%]", "h-[55%]", "h-[90%]", "h-[66%]", "h-[82%]", "h-[58%]", "h-[74%]"].map((h, i) => (
            <span key={i} className={cn("flex-1 rounded-t-[2px]", h, i === 5 ? "bg-shotaccent" : "bg-shotline")} />
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
        {["bg-shotaccent", "bg-[#8FB0C0]", "bg-[#A3B18A]"].map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 rounded-[4px] border border-shotline bg-shot px-1.5 py-1.5">
            <span className={cn("h-2 w-2 rounded-full", c)} />
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
        <div className="max-w-[78%] self-start rounded-[6px] rounded-ss-none border border-shotline border-s-2 border-s-shotaccent bg-shotup p-2">
          <div className="mb-1 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-shotaccent" />
            <span className="font-mono text-[7px] font-bold text-shotaccent">agent</span>
          </div>
          {row("100%", "bg-shotmut/50")}{row("72%", "bg-shotmut/40")}
          <span className="mt-1.5 block">{row("55%", "bg-shotmut/30")}</span>
        </div>
        <div className="max-w-[62%] self-end rounded-[6px] rounded-se-none bg-shotaccent/15 p-2">
          {row("100%", "bg-shotaccent/50")}{row("60%", "bg-shotaccent/35")}
        </div>
        <div className="flex gap-1 self-start px-1 py-0.5">
          {["delay-0", "delay-200", "delay-[400ms]"].map((d) => (
            <span key={d} className={cn("h-1 w-1 animate-pulse rounded-full bg-shotmut", d)} />
          ))}
        </div>
        <div className="mt-auto flex items-center gap-1.5 rounded-[5px] border border-shotline bg-shot p-1.5">
          {row("58%", "bg-shotup")}
          <span className="ms-auto flex h-4.5 w-4.5 items-center justify-center rounded-[4px] bg-shotaccent p-1">
            <Send className="h-2.5 w-2.5 text-shot" />
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
        <span className="h-1.5 w-1.5 rounded-full bg-shotline" />
        <span className="h-1.5 w-1.5 rounded-full bg-shotline" />
        <span className="h-1.5 w-1.5 rounded-full bg-shotaccent" />
        <span className="ms-auto flex items-center gap-1 rounded-[3px] border border-shotline px-1.5 py-0.5 font-mono text-[7px] text-sage">
          <Lock className="h-2 w-2" /> offline · encrypted
        </span>
      </div>
      <div className="flex h-[calc(100%-26px)]">
        <div className="hidden w-[22%] border-e border-shotline p-2 sm:block">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="mb-1 flex items-center gap-1 px-1 py-1">
              <span className={cn("h-1.5 w-1.5 rounded-[2px]", i === 0 ? "bg-shotaccent" : "bg-shotline")} />
              {row("70%", "bg-shotline")}
            </div>
          ))}
        </div>
        <div className="w-[34%] border-e border-shotline p-2 sm:w-[30%]">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("mb-1.5 rounded-[4px] border p-1.5", i === 0 ? "border-shotaccent/50 bg-shotup" : "border-shotline")}>
              {row("80%", i === 0 ? "bg-shotmut/60" : "bg-shotup")}
              <span className="mt-1 block">{row("50%", "bg-shotline")}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-1.5 p-2.5">
          {row("46%", "bg-shotmut/60")}
          {row("100%")}{row("88%")}{row("95%")}{row("60%")}
          <div className="mt-2 flex gap-1">
            <span className="rounded-[3px] bg-shotaccent/15 px-1.5 py-0.5 font-mono text-[7px] text-shotaccent">#ideas</span>
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
            <circle cx="22" cy="22" r="17" fill="none" stroke="#1a1f40" strokeWidth="5" />
            <circle cx="22" cy="22" r="17" fill="none" stroke="#A3B18A" strokeWidth="5" strokeLinecap="round" strokeDasharray="107" strokeDashoffset="27" transform="rotate(-90 22 22)" />
            <circle cx="22" cy="22" r="10" fill="none" stroke="#1a1f40" strokeWidth="4" />
            <circle cx="22" cy="22" r="10" fill="none" stroke="#8f88ff" strokeWidth="4" strokeLinecap="round" strokeDasharray="63" strokeDashoffset="16" transform="rotate(-90 22 22)" />
          </svg>
          <div className="flex-1 space-y-1">{row("80%", "bg-shotmut/50")}{row("55%")}</div>
        </div>
        <div className="mt-2.5 space-y-1.5">
          {[
            { p: 80, w: "w-4/5" },
            { p: 55, w: "w-[55%]" },
            { p: 35, w: "w-[35%]" },
          ].map((item, i) => (
            <div key={i} className="rounded-[4px] border border-shotline p-1.5">
              <div className="mb-1 flex justify-between">{row("52%", "bg-shotup")}<span className="font-mono text-[7px] text-shotmut">{item.p}%</span></div>
              <div className="h-1 overflow-hidden rounded-full bg-shotup">
                <div className={cn("h-full rounded-full", item.w, ["bg-sage", "bg-shotaccent", "bg-steel"][i])} />
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
          <span className="h-1.5 w-1.5 rounded-full bg-shotline" />
          <span className="h-1.5 w-1.5 rounded-full bg-shotline" />
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
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-shotaccent"><Sparkles className="h-2 w-2 text-shot" /></span>
          <span className="font-mono text-[8px] font-bold text-shotink">DbsChatBot</span>
          <span className="pulse-dot ms-auto h-1.5 w-1.5 rounded-full bg-sage" />
        </div>
        <div className="space-y-1.5 p-2">
          <div className="max-w-[82%] rounded-[5px] rounded-ss-none bg-shot p-1.5">{row("100%", "bg-shotmut/50")}{row("65%", "bg-shotmut/35")}</div>
          <div className="ms-auto max-w-[60%] rounded-[5px] rounded-se-none bg-shotaccent/20 p-1.5">{row("90%", "bg-shotaccent/50")}</div>
          <div className="flex items-center gap-1 rounded-[4px] border border-shotline bg-shot p-1">
            {row("55%", "bg-shotup")}
            <Send className="ms-auto h-2.5 w-2.5 text-shotaccent" />
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
            i === 3 ? "border-shotaccent/60" : "border-shotline"
          )}
        >
          <tool.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", i === 3 ? "text-shotaccent" : "text-shotmut")} strokeWidth={1.8} />
          <span className="font-mono text-[7.5px] uppercase tracking-wider text-shotmut">{tool.label}</span>
          {i === 3 ? (
            <span className="h-1 w-3/4 overflow-hidden rounded-full bg-shotup"><span className="block h-full w-[72%] rounded-full bg-shotaccent" /></span>
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
    <div className="absolute inset-4 flex flex-col gap-2 overflow-hidden rounded-[10px] border border-shotline bg-shotpanel p-2.5 font-[family-name:Vazirmatn_Variable,sans-serif] sm:inset-6" dir="rtl">
      <div className="flex items-center gap-1.5">
        {["مهر", "آبان", "آذر"].map((m, i) => (
          <span key={m} className={cn("rounded-[4px] px-2 py-0.5 text-[9px] font-bold", i === 1 ? "bg-shotaccent text-shot" : "border border-shotline text-shotmut")}>
            {m}
          </span>
        ))}
        <span className="ms-auto h-4 w-4 rounded-full border border-shotline bg-shotup" />
      </div>
      <div className="rounded-[6px] border border-shotline bg-shot p-2.5">
        <span className="text-[8px] text-shotmut">موجودی کل</span>
        <div className="mt-0.5 font-mono text-[15px] font-bold text-shotaccent" dir="ltr">۱۲٬۴۸۰٬۰۰۰ <span className="text-[9px] text-shotmut">تومان</span></div>
      </div>
      <div className="flex-1 space-y-1.5">
        {[
          { p: 80, c: "bg-sage", w: "w-4/5" },
          { p: 45, c: "bg-shotaccent", w: "w-[45%]" },
          { p: 20, c: "bg-steel", w: "w-1/5" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 rounded-[5px] border border-shotline p-1.5">
            <span className="h-2 w-2 rounded-full bg-shotline" />
            <span className="h-1.5 w-14 rounded-full bg-shotup" />
            <div className="ms-auto flex w-[38%] items-center gap-1.5">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-shotup"><div className={cn("h-full rounded-full", item.c, item.w)} /></div>
              <span className="font-mono text-[7px] text-shotmut" dir="ltr">{item.p}%</span>
            </div>
          </div>
        ))}
      </div>
      <span className="absolute bottom-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-shotaccent text-shot shadow-lg">
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </span>
    </div>
  );
}

/** Patient education portal: search-led home, topic catalogue, PDF reader and video. */
function MockPatient() {
  return (
    <div className="absolute inset-4 overflow-hidden rounded-[10px] border border-shotline bg-shotpanel sm:inset-6">
      <div className="flex items-center gap-1.5 border-b border-shotline px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-shotline" />
        <span className="h-1.5 w-1.5 rounded-full bg-shotline" />
        <span className="ms-2 h-2 w-28 rounded-full bg-shot" />
      </div>
      <div className="grid h-[calc(100%-22px)] grid-cols-[1.35fr_1fr] gap-2 p-2.5">
        <div className="flex flex-col gap-2">
          <div className="rounded-[6px] bg-gradient-to-br from-[#2b3a8f] to-[#1a1f40] p-2.5">
            <span className="block h-1.5 w-[55%] rounded-full bg-shotink/80" />
            <span className="mt-1 block h-1.5 w-[38%] rounded-full bg-shotink/50" />
            <div className="mt-2.5 flex items-center gap-1 rounded-[4px] bg-shot/80 p-1">
              <FileSearch className="h-2.5 w-2.5 text-shotmut" />
              {row("48%", "bg-shotup")}
            </div>
          </div>
          <div className="grid flex-1 grid-cols-3 gap-1.5">
            {["bg-[#7fd6a0]", "bg-shotaccent", "bg-steel"].map((c, i) => (
              <div key={i} className="flex flex-col gap-1 rounded-[5px] border border-shotline bg-shot p-1.5">
                <span className={cn("h-3 w-3 rounded-[3px] opacity-80", c)} />
                {row("80%", "bg-shotmut/50")}
                {row("55%", "bg-shotline")}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="relative flex-1 overflow-hidden rounded-[6px] border border-shotline bg-shot">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e1d] to-[#2b3a8f]/40" />
            <span className="absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-shotink/90">
              <span className="ms-0.5 h-0 w-0 border-y-[4px] border-s-[6px] border-y-transparent border-s-shot" />
            </span>
            <span className="absolute inset-x-2 bottom-1.5 h-0.5 rounded-full bg-shotline">
              <span className="block h-full w-[38%] rounded-full bg-shotaccent" />
            </span>
          </div>
          <div className="flex gap-1.5 rounded-[6px] border border-shotline bg-shot p-1.5">
            <div className="flex h-9 w-7 shrink-0 flex-col gap-0.5 rounded-[2px] bg-shotink/90 p-1">
              {row("90%", "bg-shot/40")}
              {row("70%", "bg-shot/30")}
              {row("80%", "bg-shot/30")}
            </div>
            <div className="flex flex-1 flex-col justify-center gap-1">
              {row("72%", "bg-shotmut/50")}
              <span className="font-mono text-[6.5px] text-shotmut">PDF · 48 pp</span>
            </div>
          </div>
        </div>
      </div>
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
  patient: MockPatient,
  concept: MockConcept,
};

/* ------------------------------------------------------------------ */
/*  Proof pieces                                                        */
/* ------------------------------------------------------------------ */

export type ProjectItem = import("../lib/projects").LocalizedProject;

/** Latin project names keep the Latin display cut on Persian pages. */
function nameDir(project: ProjectItem) {
  return /[؀-ۿ]/.test(project.name) ? undefined : "ltr";
}

function StatusBadge({ status }: { status?: "production" | "concept" }) {
  const { t } = useApp();
  if (status !== "concept") return null;
  return (
    <span className="inline-flex items-center rounded-full border border-dashed border-ink3 px-2.5 py-0.5 text-[12px] font-semibold text-ink2">
      {t.projects.statusConcept}
    </span>
  );
}

/** The artwork inside a proof: the real render when there is one, otherwise the drawn mock. */
function ProjectMedia({ project, eager = false }: { project: ProjectItem; eager?: boolean }) {
  if (project.image_url) {
    return (
      <img
        src={project.image_url}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
      />
    );
  }
  const Mock = mocks[project.mock as MockKind] ?? MockConcept;
  return (
    <Shot>
      <Mock />
    </Shot>
  );
}

/** Media framed as a press proof: crop marks outside the trim. */
function ProofFrame({
  project,
  to,
  label,
  className,
  eager,
}: {
  project: ProjectItem;
  to?: string;
  label?: string;
  className?: string;
  eager?: boolean;
}) {
  const media = (
    <div className={cn("proof-media aspect-[3/2]", project.status === "concept" && "outline-1 outline-dashed outline-offset-4 outline-line2", className)}>
      <ProjectMedia project={project} eager={eager} />
    </div>
  );
  return (
    <div className="crop">
      <CropMarks />
      {to ? (
        <Link to={to} aria-label={label} className="block">
          {media}
        </Link>
      ) : (
        media
      )}
    </div>
  );
}

function ProjectProof({ project, index, headingLevel = "h3" }: { project: ProjectItem; index: number; headingLevel?: "h2" | "h3" }) {
  const { t, lang } = useApp();
  const to = localePath(lang, `/projects/${project.slug}`);
  const flip = index % 2 === 1;
  const Heading = headingLevel;

  return (
    <article className="proof sheet w-full content-start items-center gap-y-6 lg:gap-y-8">
      <div className={cn("lg:col-span-7", flip && "lg:order-2 lg:col-start-6")}>
        <ProofFrame project={project} to={to} label={t.projects.previewAria.replace("{name}", project.name)} />
      </div>
      <div className={cn("lg:col-span-4", flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-9")}>
        <p className="meta">{project.tags.join(", ")}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Heading className={cn("display t-project", nameDir(project) && "latin-display")} dir={nameDir(project)}>
            <Link to={to} className="transition-colors hover:text-accent">
              {project.name}
            </Link>
          </Heading>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-4 line-clamp-3 text-[16px] leading-relaxed text-ink lg:mt-5 lg:line-clamp-none lg:text-[17px]">{project.subtitle}</p>
        <p className="meta mt-5 hidden lg:block">
          <span className="text-ink2">{t.projects.roleLabel}: </span>
          {project.role.slice(0, 3).join(", ")}
        </p>
        <Link to={to} className="link mt-5 inline-block text-[15px] font-semibold lg:mt-7">
          {t.projects.readCase}
        </Link>
      </div>
    </article>
  );
}

/** Most projects the home-page teaser shows. */
const TEASER_LIMIT = 4;

/**
 * Home-page teaser picks, derived from content rather than a hardcoded slug list
 * (a slug list once went stale when those projects moved to draft, and the home page
 * shipped an empty section). Order: shipped before concept, featured before the rest,
 * then content `order`.
 */
function teaserProjects(all: ProjectItem[]): ProjectItem[] {
  const rank = (p: ProjectItem) => (p.status === "concept" ? 2 : 0) + (p.featured ? 0 : 1);
  return [...all]
    .map((project, index) => ({ project, index }))
    .sort((a, b) => rank(a.project) - rank(b.project) || a.index - b.index)
    .slice(0, TEASER_LIMIT)
    .map(({ project }) => project);
}

type ProjectsProps = {
  mode?: "teaser" | "full";
};

export default function Projects({ mode = "full" }: ProjectsProps) {
  const { t, lang } = useApp();
  const [filter, setFilter] = useState("all");
  const isTeaser = mode === "teaser";

  const items = useMemo(
    () => (isTeaser ? teaserProjects(t.projects.items) : t.projects.items),
    [isTeaser, t.projects.items]
  );
  // Only offer filters that match at least one project.
  const filters = useMemo(
    () => t.projects.filters.filter((tag) => items.some((p) => p.tags.includes(tag))),
    [items, t.projects.filters]
  );
  const shown = items.filter((p) => filter === "all" || p.tags.includes(filter));
  const nf = new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US");

  if (isTeaser) {
    return (
      <section id="projects" className="section-pad border-t border-line">
        <div className="wrap">
          <SectionHead kicker={t.projects.kicker} title={t.projects.title} lead={t.projects.lead} />
          <div data-testid="projects-teaser" className="mt-10 md:mt-16 lg:mt-24">
            <Slider label={t.projects.title} desktopClassName="lg:flex-col lg:gap-36" slideClassName="">
              {shown.map((p, i) => (
                <ProjectProof key={p.id} project={p} index={i} />
              ))}
            </Slider>
          </div>
          <div className="mt-10 flex justify-center md:mt-16 lg:mt-28">
            <Link to={localePath(lang, "/projects")} className="btn btn-ghost">
              {t.projects.seeAll}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="pb-[clamp(72px,9vw,160px)] pt-10 md:pt-16">
      <div className="wrap">
        <SectionHead as="h1" size="page" kicker={t.projects.pageKicker} title={t.projects.pageTitle} lead={t.projects.pageLead} />

        <div className="sheet mt-8 md:mt-16">
          <div className="flex flex-wrap items-center gap-2 lg:col-span-9 lg:col-start-4" role="group" aria-label={t.projects.pageKicker}>
            <button
              type="button"
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
              className="chip chip-hover aria-pressed:border-rule aria-pressed:bg-ink aria-pressed:text-page"
            >
              {t.projects.filterAll}
              <span className="tnum opacity-60">{nf.format(items.length)}</span>
            </button>
            {filters.map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed={filter === tag}
                onClick={() => setFilter(tag)}
                className="chip chip-hover aria-pressed:border-rule aria-pressed:bg-ink aria-pressed:text-page"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div data-testid="projects-grid" className="mt-8 md:mt-14 lg:mt-24">
          <Slider key={filter} label={t.projects.pageTitle} desktopClassName="lg:flex-col lg:gap-36" slideClassName="">
            {shown.map((p, i) => (
              <ProjectProof key={p.id} project={p} index={i} headingLevel="h2" />
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Case study                                                          */
/* ------------------------------------------------------------------ */

/** Job ticket: the facts of the engagement, only the fields that exist. */
function JobTicket({ project }: { project: ProjectItem }) {
  const { t } = useApp();
  const rows: { key: string; label: string; value: ReactNode }[] = [];

  if (project.year) rows.push({ key: "year", label: t.projects.metaYear, value: project.year });
  if (project.durationMonths != null) {
    rows.push({
      key: "duration",
      label: t.projects.metaDuration,
      value: t.projects.metaDurationValue.replace("{n}", String(project.durationMonths)),
    });
  }
  if (project.teamSize) rows.push({ key: "team", label: t.projects.metaTeam, value: project.teamSize });
  if (project.clientType) rows.push({ key: "client", label: t.projects.metaClient, value: project.clientType });
  if (project.links && project.links.length > 0) {
    rows.push({
      key: "links",
      label: t.projects.metaLinks,
      value: (
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          {project.links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="link">
              {link.label}
            </a>
          ))}
        </span>
      ),
    });
  }
  rows.push({ key: "role", label: t.projects.roleLabel, value: project.role.join(", ") });
  rows.push({ key: "tech", label: t.projects.techLabel, value: <span dir="ltr">{project.tech.join(", ")}</span> });

  return (
    <dl className="border-t border-rule">
      {rows.map((row) => (
        <div key={row.key} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-line py-3.5 text-[15px] sm:grid-cols-[9rem_minmax(0,1fr)]">
          <dt className="text-ink3">{row.label}</dt>
          <dd className="min-w-0 text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProjectDetailView({ project }: { project: ProjectItem }) {
  const { t, lang } = useApp();
  const all = t.projects.items;
  const idx = all.findIndex((p) => p.slug === project.slug);
  const next = all.length > 1 && idx !== -1 ? all[(idx + 1) % all.length] : undefined;

  const story = [
    { key: "problem", label: t.projects.problemLabel, body: project.problem },
    { key: "approach", label: t.projects.approachLabel, body: project.approach },
    { key: "result", label: t.projects.resultLabel, body: project.result },
  ].filter((s) => s.body);

  return (
    <article className="pb-[clamp(72px,9vw,160px)] pt-10 md:pt-16">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { label: t.nav.home, to: localePath(lang, "/") },
            { label: t.nav.projects, to: localePath(lang, "/projects") },
            { label: project.name },
          ]}
        />

        <header className="sheet mt-10 md:mt-14">
          <p className="meta lg:col-span-3 lg:pt-4">{project.tags.join(", ")}</p>
          <div className="lg:col-span-9">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className={cn("display t-page", nameDir(project) && "latin-display")} dir={nameDir(project)}>
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="display t-sub mt-8 max-w-[28ch] text-accent">{project.subtitle}</p>
          </div>
        </header>

        <div className="mt-14 md:mt-20">
          <ProofFrame project={project} eager className="md:aspect-[16/9]" />
        </div>

        <div className="sheet mt-14 md:mt-20">
          <div className="lg:col-span-5 lg:col-start-4">
            <p className="lead text-ink">{project.desc}</p>
          </div>
          <div className="mt-6 lg:col-span-4 lg:col-start-9 lg:mt-0">
            <JobTicket project={project} />
          </div>
        </div>

        {story.length > 0 && (
          <ol className="sheet mt-16 border-t border-rule pt-10 md:mt-24 md:pt-14">
            {story.map((s, i) => (
              <li key={s.key} className={cn("lg:col-span-3", i === 0 && "lg:col-start-4")}>
                <h2 className="text-[15px] font-semibold text-accent">{s.label}</h2>
                <p className="mt-3 text-[16px] leading-relaxed text-ink2">{s.body}</p>
              </li>
            ))}
          </ol>
        )}

        {project.caps && project.caps.length > 0 && (
          <div className="sheet mt-16 md:mt-24">
            <h2 className="kicker lg:col-span-3">{t.projects.capsLabel}</h2>
            <ul className="grid gap-x-8 sm:grid-cols-2 lg:col-span-9">
              {project.caps.map((c) => (
                <li key={c} className="flex items-baseline gap-3 border-b border-line py-3 text-[16px]">
                  <Check className="h-4 w-4 shrink-0 translate-y-0.5 text-accent" strokeWidth={2.2} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-20 flex flex-col gap-10 border-t border-line pt-12 md:mt-28 md:flex-row md:items-end md:justify-between">
          <Link
            to={`${localePath(lang, "/contact")}?project=${encodeURIComponent(project.slug)}`}
            className="btn btn-primary w-full sm:w-auto"
          >
            {t.projects.discuss}
          </Link>
          {next && next.slug !== project.slug && (
            <Link to={localePath(lang, `/projects/${next.slug}`)} className="group block md:text-end">
              <span className="meta block">{t.projects.next}</span>
              <span
                className={cn("display mt-2 block text-[2.5rem] transition-colors group-hover:text-accent md:text-[3.5rem]", nameDir(next) && "latin-display")}
                dir={nameDir(next)}
              >
                {next.name}
              </span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
