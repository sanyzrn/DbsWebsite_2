import { useEffect, useRef, useState } from "react";
import { ArrowDownLeft, Check, Pencil, Trash2 } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import { NEX_COPY, NEX_NOTE_KEY, NEX_NOTE_LIMIT } from "../../lib/nex";

export default function LocalNote({ lang }: { lang: Lang }) {
  const copy = NEX_COPY[lang];
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const editRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fa = lang === "fa";

  // Identical empty server/first client render, then restore optional local storage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(NEX_NOTE_KEY);
      if (raw) {
        try {
          const note: unknown = JSON.parse(raw);
          if (note && typeof note === "object" && "text" in note && typeof note.text === "string") {
            setText(note.text.slice(0, NEX_NOTE_LIMIT));
            setSubmitted("submitted" in note && note.submitted === true && Boolean(note.text.trim()));
          }
        } catch {
          // A malformed draft must not prevent starting a fresh one.
        }
      }
    } catch {
      setPersistent(false);
    }
    setReady(true);
  }, []);

  function update(next: string, submit = false) {
    setText(next);
    setSubmitted(submit);
    try {
      if (next) localStorage.setItem(NEX_NOTE_KEY, JSON.stringify(submit ? { text: next, submitted: true } : { text: next }));
      else localStorage.removeItem(NEX_NOTE_KEY);
      setPersistent(true);
    } catch {
      setPersistent(false);
    }
  }

  return (
    <article className={`nex-card nex-draft${text.trim() ? " nex-draft--written" : ""}`} data-enhanced={ready} data-submitted={submitted} aria-labelledby="nex-draft-title">
      <div className="nex-card-meta">
        <h3 id="nex-draft-title"><ArrowDownLeft size={15} aria-hidden="true" />{copy.draftLabel}</h3>
        {text && <button className="nex-clear" type="button" onClick={() => update("")} aria-label={copy.draftClear}><Trash2 size={15} aria-hidden="true" /></button>}
      </div>
      <div className="nex-draft-editor">
        <label className="nex-sr-only" htmlFor="nex-local-note">{copy.draftPlaceholder}</label>
        <textarea ref={inputRef} id="nex-local-note" hidden={submitted} dir="auto" value={text} onChange={(event) => update(event.target.value)} onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
          event.preventDefault();
          if (!text.trim()) return;
          update(text, true);
          requestAnimationFrame(() => editRef.current?.focus({ preventScroll: true }));
        }} placeholder={copy.draftPlaceholder} maxLength={NEX_NOTE_LIMIT} rows={2} disabled={!ready} aria-describedby="nex-draft-privacy nex-draft-status" spellCheck={false} />
        {submitted && <div className="nex-submitted-note"><p dir="auto" tabIndex={0} role="region" aria-label={fa ? "یادداشت ثبت‌شده" : "Captured note"}>{text}</p><button ref={editRef} className="nex-edit-note" type="button" onClick={() => {
          update(text);
          requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
        }}><Pencil size={13} aria-hidden="true" />{fa ? "ویرایش یادداشت" : "Edit note"}</button></div>}
        {!submitted && <p className="nex-draft-help nex-fine-print">{fa ? "Enter برای ثبت · Shift+Enter برای خط جدید" : "Enter to capture · Shift+Enter for a new line"}</p>}
      </div>
      <p id="nex-draft-status" className="nex-draft-status" role="status">
        {text ? <><Check size={13} aria-hidden="true" />{submitted ? (fa ? "ثبت شد. " : "Captured. ") : ""}{persistent ? copy.draftSaved : copy.draftSession}</> : copy.draftHint}
      </p>
      <p id="nex-draft-privacy" className="nex-fine-print">{copy.draftPrivacy}</p>
      <noscript><p className="nex-fine-print">{copy.noJs}</p></noscript>
    </article>
  );
}
