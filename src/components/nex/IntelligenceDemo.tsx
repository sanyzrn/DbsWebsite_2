import { useEffect, useState } from "react";
import { ArrowRight, RotateCw } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import NexMark from "./NexMark";

const COPY = {
  fa: {
    toggle: "دموی هوش مصنوعی",
    asleep: "فکرها منتظر اشارهٔ تو هستند.",
    awake: "یک فکر، سه قدم بعدی.",
    next: "یک فکر دیگر",
    note: "دموی تعاملی با نمونه‌های آماده؛ بدون اجرای مدل یا ارسال اطلاعات.",
    steps: ["ثبت کن", "وصل کن", "انجام بده"],
    thoughts: [
      { source: "ایدهٔ تازه برای قرار کافه", connections: ["ایده را یادداشت کن", "به قرار کافه وصلش کن", "قبل از قرار مرورش کن"] },
      { source: "آخر هفته، یک سفر کوچک", connections: ["مقصدها را بنویس", "فهرست وسایل بساز", "زمان حرکت را یادآوری کن"] },
      { source: "یک طرح که نباید گم شود", connections: ["اسکچ را ثبت کن", "مرجع‌ها را کنارش بگذار", "قدم بعدی را مشخص کن"] },
    ],
  },
  en: {
    toggle: "AI demo",
    asleep: "Your thoughts are waiting for your cue.",
    awake: "One thought. Three next steps.",
    next: "Another thought",
    note: "An interactive demo with prepared examples; no model runs or data sent.",
    steps: ["Capture", "Connect", "Act"],
    thoughts: [
      { source: "A fresh idea for the coffee catch-up", connections: ["Catch the idea", "Link it to the coffee plan", "Review it before you meet"] },
      { source: "A little weekend escape", connections: ["Write down destinations", "Make a packing checklist", "Set a departure reminder"] },
      { source: "A design worth keeping", connections: ["Capture the sketch", "Keep references alongside it", "Choose the next step"] },
    ],
  },
} as const;

export default function IntelligenceDemo({ lang }: { lang: Lang }) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const c = COPY[lang];
  const thought = c.thoughts[index];
  useEffect(() => setReady(true), []);

  return <div className="nex-intelligence" data-enabled={enabled}>
    <button className="nex-ai-switch" type="button" role="switch" aria-checked={enabled} aria-label={c.toggle} aria-controls="nex-ai-connections" disabled={!ready} onClick={() => setEnabled(!enabled)}><i aria-hidden="true" /><span aria-hidden="true">{enabled ? "ON" : "OFF"}</span></button>
    <p className="nex-ai-status" role="status">{enabled ? c.awake : c.asleep}</p>
    <div className="nex-ai-canvas" id="nex-ai-connections">
      <div className="nex-ai-seed"><NexMark className="nex-ai-mark" /><p>{enabled ? thought.source : "…"}</p></div>
      {enabled && <ol className="nex-ai-connections" key={index}>{thought.connections.map((connection, i) => <li key={connection}><span>{c.steps[i]}</span><p>{connection}</p><ArrowRight size={13} aria-hidden="true" /></li>)}</ol>}
    </div>
    <button className="nex-ai-next" type="button" disabled={!enabled} onClick={() => setIndex((index + 1) % c.thoughts.length)}><RotateCw size={14} aria-hidden="true" />{c.next}</button>
    <p className="nex-fine-print">{c.note}</p>
  </div>;
}
