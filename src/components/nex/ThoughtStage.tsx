import { useEffect, useState } from "react";
import { Check, FileText, Mic } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import { NEX_COPY } from "../../lib/nex";
import { NEX_EXPERIENCE } from "../../lib/nexExperience";
import NexMark from "./NexMark";
import NexWordmark from "./NexWordmark";

const BARS = [18, 32, 23, 46, 34, 20, 39, 55, 31, 19, 44, 27, 53, 35, 22, 41, 29, 18, 37, 51, 24, 32, 17, 27];

export default function ThoughtStage({ lang }: { lang: Lang }) {
  const c = NEX_COPY[lang];
  const e = NEX_EXPERIENCE[lang];
  const [mode, setMode] = useState("text");
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return <div className="nex-universe" role="group" data-mode={mode} aria-label={e.sceneLabel}>
    <div className="nex-orbit-scene">
      <svg className="nex-connections" viewBox="0 0 600 520" fill="none" aria-hidden="true">
        <ellipse cx="300" cy="270" rx="232" ry="148" transform="rotate(-26 300 270)" />
        <ellipse cx="300" cy="270" rx="180" ry="230" transform="rotate(36 300 270)" />
        <path className="nex-connection-thread" d="M130 155C390 20 480 215 300 270S160 420 460 411" />
        <circle cx="96" cy="288" r="5" /><circle cx="448" cy="104" r="5" /><circle cx="493" cy="340" r="5" />
      </svg>
      <div className="nex-thought-core" aria-hidden="true"><NexMark /><NexWordmark className="nex-core-word" /></div>
      <article className="nex-scene-note nex-scene-text" dir={lang === "fa" ? "rtl" : "ltr"}>
        <div className="nex-scene-meta"><FileText size={15} aria-hidden="true" /><span>{c.textLabel}</span><span>{lang === "fa" ? "۱۰:۴۲" : "10:42"}</span></div>
        <p>{e.sampleNote}</p><span className="nex-scene-tag"># {lang === "fa" ? "فکر_تازه" : "fresh_thought"}</span>
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
        <input type="radio" name="nex-capture-mode" value={id} checked={mode === id} onChange={() => setMode(id)} />
        <span><Icon size={15} aria-hidden="true" />{label}</span>
      </label>)}</div>
    </fieldset>
    <p className="nex-scene-disclaimer">{e.sampleLabel}</p>
  </div>;
}
