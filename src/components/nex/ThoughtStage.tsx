import { useEffect, useRef, useState } from "react";
import { Check, FileText, Mic } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import { NEX_COPY } from "../../lib/nex";
import { NEX_EXPERIENCE } from "../../lib/nexExperience";
import NexMark from "./NexMark";
import NexWordmark from "./NexWordmark";

const BARS = [18, 32, 23, 46, 34, 20, 39, 55, 31, 19, 44, 27, 53, 35, 22, 41, 29, 18, 37, 51, 24, 32, 17, 27];

export default function ThoughtStage({ lang, personalThought = "" }: { lang: Lang; personalThought?: string }) {
  const c = NEX_COPY[lang];
  const e = NEX_EXPERIENCE[lang];
  const [mode, setMode] = useState("text");
  const [ready, setReady] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  useEffect(() => setReady(true), []);

  useEffect(() => {
    const scene = sceneRef.current;
    const core = coreRef.current;
    if (!scene || !core) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let x = 0;
    let y = 0;
    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      scene!.style.removeProperty("--nx-eye-x");
      scene!.style.removeProperty("--nx-eye-y");
      scene!.style.removeProperty("--nx-look-tilt");
    }
    function look(event: PointerEvent) {
      if (calm.matches || !hover.matches || event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = core!.getBoundingClientRect();
        const dx = x - bounds.left - bounds.width / 2;
        const dy = y - bounds.top - bounds.height / 2;
        const scale = Math.max(Math.hypot(dx, dy), 100);
        scene!.style.setProperty("--nx-eye-x", `${(dx / scale * 7).toFixed(2)}px`);
        scene!.style.setProperty("--nx-eye-y", `${(dy / scale * 7).toFixed(2)}px`);
        scene!.style.setProperty("--nx-look-tilt", `${(dx / scale * 4).toFixed(2)}deg`);
      });
    }
    scene.addEventListener("pointermove", look, { passive: true });
    scene.addEventListener("pointerleave", reset);
    calm.addEventListener("change", reset);
    hover.addEventListener("change", reset);
    return () => {
      reset();
      scene.removeEventListener("pointermove", look);
      scene.removeEventListener("pointerleave", reset);
      calm.removeEventListener("change", reset);
      hover.removeEventListener("change", reset);
    };
  }, []);

  return <div className="nex-universe" role="group" data-mode={mode} data-personal={Boolean(personalThought)} aria-label={e.sceneLabel}>
    <div ref={sceneRef} className="nex-orbit-scene">
      <svg className="nex-connections" viewBox="0 0 600 520" fill="none" aria-hidden="true">
        <ellipse cx="300" cy="270" rx="232" ry="148" transform="rotate(-26 300 270)" />
        <ellipse cx="300" cy="270" rx="180" ry="230" transform="rotate(36 300 270)" />
        <path className="nex-connection-thread" d="M130 155C390 20 480 215 300 270S160 420 460 411" />
        <circle cx="96" cy="288" r="5" /><circle cx="448" cy="104" r="5" /><circle cx="493" cy="340" r="5" />
      </svg>
      <svg className="nex-reaching-arms" viewBox="0 0 600 520" fill="none" aria-hidden="true">
        <path className="nex-reach nex-reach--text" pathLength="1" d="M310 260C245 290 215 210 165 160" />
        <path className="nex-reach nex-reach--voice" pathLength="1" d="M310 260C360 330 390 270 460 295" />
        <path className="nex-reach nex-reach--checklist" pathLength="1" d="M310 260C355 390 165 350 170 425" />
      </svg>
      <div ref={coreRef} className="nex-thought-core" aria-hidden="true"><NexMark alive className="nex-live-mark" /><NexWordmark className="nex-core-word" /></div>
      <article className="nex-scene-note nex-scene-text" dir={lang === "fa" ? "rtl" : "ltr"}>
        <div className="nex-scene-meta"><FileText size={15} aria-hidden="true" /><span>{c.textLabel}</span><span>{lang === "fa" ? "۱۰:۴۲" : "10:42"}</span></div>
        <p key={personalThought ? "personal" : "example"} className="nex-orbit-thought" dir={personalThought ? "auto" : undefined}>{personalThought || e.sampleNote}</p><span className="nex-scene-tag">{personalThought ? e.personalLabel : `# ${lang === "fa" ? "فکر_تازه" : "fresh_thought"}`}</span>
      </article>
      <article className="nex-scene-note nex-scene-voice" dir={lang === "fa" ? "rtl" : "ltr"}>
        <div className="nex-scene-meta"><Mic size={15} aria-hidden="true" /><span>{c.voiceLabel}</span></div>
        <div className="nex-scene-wave" aria-hidden="true">{BARS.map((n, i) => <i key={i} className={`nex-bar-${n}`} />)}</div>
        <p>{e.sampleVoice}</p>
      </article>
      <article className="nex-scene-note nex-scene-checklist" dir={lang === "fa" ? "rtl" : "ltr"}>
        <div className="nex-scene-meta"><Check size={15} aria-hidden="true" /><span>{c.checklistLabel}</span></div>
        <ul>{e.sampleChecklist.map((item, i) => <li key={item}><span className={i < 2 ? "nex-scene-tick is-checked" : "nex-scene-tick"}>{i < 2 && <Check size={12} aria-hidden="true" />}</span>{item}</li>)}</ul>
      </article>
      <span className="nex-scene-coordinate" aria-hidden="true">nex / connections</span>
    </div>
    <fieldset className="nex-capture-switch" disabled={!ready}>
      <legend>{e.sceneLegend}</legend>
      <div>{[{ id: "text", label: c.textLabel, icon: FileText }, { id: "voice", label: c.voiceLabel, icon: Mic }, { id: "checklist", label: c.checklistLabel, icon: Check }].map(({ id, label, icon: Icon }) => <label key={id}>
        <input type="radio" name="nex-capture-mode" value={id} checked={mode === id} onFocus={() => setMode(id)} onChange={() => setMode(id)} />
        <span><Icon size={15} aria-hidden="true" />{label}</span>
      </label>)}</div>
    </fieldset>
    <p className="nex-scene-disclaimer">{personalThought ? e.personalLabel : e.sampleLabel}</p>
  </div>;
}
