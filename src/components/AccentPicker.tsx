import { useEffect, useId, useRef, useState } from "react";
import { useApp } from "../lib/app";
import { ACCENTS } from "../lib/accent";
import { cn } from "../utils/cn";

/** Row of ink swatches. A radiogroup: one spot colour is always selected. */
export function AccentSwatches({ className, onPicked }: { className?: string; onPicked?: () => void }) {
  const { t, accent, setAccent } = useApp();

  return (
    <div role="radiogroup" aria-label={t.accent.label} className={cn("flex items-center gap-1.5", className)}>
      {ACCENTS.map((a) => {
        const selected = a.id === accent;
        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={t.accent.names[a.id]}
            title={t.accent.names[a.id]}
            onClick={() => {
              setAccent(a.id);
              onPicked?.();
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110",
              selected && "ring-1 ring-ink3 ring-offset-2 ring-offset-surface2"
            )}
          >
            <span aria-hidden="true" className={cn("block h-5 w-5 rounded-full", a.swatch)} />
          </button>
        );
      })}
    </div>
  );
}

/** Header control (lg+): the current spot colour as a dot that opens a small swatch tray. */
export function AccentMenu() {
  const { t, accent } = useApp();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trayId = useId();
  const current = ACCENTS.find((a) => a.id === accent) ?? ACCENTS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (e.target instanceof Node && !wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative hidden lg:block">
      <button
        type="button"
        aria-label={t.accent.pick}
        aria-expanded={open}
        aria-controls={trayId}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface"
      >
        <span aria-hidden="true" className={cn("block h-4 w-4 rounded-full ring-2 ring-surface2", current.swatch)} />
      </button>
      <div
        id={trayId}
        inert={!open}
        className={cn(
          "absolute end-0 top-full z-50 pt-2 transition-[opacity,transform] duration-200 ease-out",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        )}
      >
        <div className="rounded-[14px] border border-line bg-surface2/95 p-3 shadow-[var(--shadow-sheet)] backdrop-blur-md">
          <p className="meta mb-2 px-1">{t.accent.label}</p>
          <AccentSwatches onPicked={() => setOpen(false)} />
        </div>
      </div>
    </div>
  );
}
