import { useEffect, useState } from "react";
import { ArrowDownLeft, Check, Trash2 } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import { NEX_COPY, NEX_NOTE_KEY, NEX_NOTE_LIMIT } from "../../lib/nex";

export default function LocalNote({ lang }: { lang: Lang }) {
  const copy = NEX_COPY[lang];
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);

  // Identical empty server/first client render, then restore optional local storage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(NEX_NOTE_KEY);
      if (raw) {
        try {
          const note: unknown = JSON.parse(raw);
          if (note && typeof note === "object" && "text" in note && typeof note.text === "string") {
            setText(note.text.slice(0, NEX_NOTE_LIMIT));
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

  function update(next: string) {
    setText(next);
    try {
      if (next) localStorage.setItem(NEX_NOTE_KEY, JSON.stringify({ text: next }));
      else localStorage.removeItem(NEX_NOTE_KEY);
      setPersistent(true);
    } catch {
      setPersistent(false);
    }
  }

  return (
    <article className={`nex-card nex-draft${text.trim() ? " nex-draft--written" : ""}`} data-enhanced={ready} aria-labelledby="nex-draft-title">
      <div className="nex-card-meta">
        <h3 id="nex-draft-title"><ArrowDownLeft size={15} aria-hidden="true" />{copy.draftLabel}</h3>
        {text && <button className="nex-clear" type="button" onClick={() => update("")} aria-label={copy.draftClear}><Trash2 size={15} aria-hidden="true" /></button>}
      </div>
      <label className="nex-sr-only" htmlFor="nex-local-note">{copy.draftPlaceholder}</label>
      <textarea id="nex-local-note" dir="auto" value={text} onChange={(event) => update(event.target.value)} placeholder={copy.draftPlaceholder} maxLength={NEX_NOTE_LIMIT} rows={2} disabled={!ready} aria-describedby="nex-draft-privacy nex-draft-status" spellCheck={false} />
      <p id="nex-draft-status" className="nex-draft-status" role="status">
        {text ? <><Check size={13} aria-hidden="true" />{persistent ? copy.draftSaved : copy.draftSession}</> : copy.draftHint}
      </p>
      <p id="nex-draft-privacy" className="nex-fine-print">{copy.draftPrivacy}</p>
      <noscript><p className="nex-fine-print">{copy.noJs}</p></noscript>
    </article>
  );
}
