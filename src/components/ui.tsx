import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useApp } from "../lib/app";
import { cn } from "../utils/cn";

/* ------------------------------------------------------------------ */
/*  Reveal — kept as a plain wrapper                                    */
/*  The site spends its motion budget on one orchestrated moment (the   */
/*  hero coming into register), so sections render statically.         */
/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  /** Accepted for API compatibility; sections no longer stagger in. */
  delay?: number;
  className?: string;
}) {
  return <div className={cn("reveal", className)}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/*  Printer's marks                                                     */
/* ------------------------------------------------------------------ */

/** Four crop marks sitting just outside the trim of the wrapped frame. */
export function CropMarks() {
  return (
    <>
      <span className="crop-mark crop-tl" aria-hidden="true" />
      <span className="crop-mark crop-tr" aria-hidden="true" />
      <span className="crop-mark crop-bl" aria-hidden="true" />
      <span className="crop-mark crop-br" aria-hidden="true" />
    </>
  );
}

/** Registration target — the mark every separation is aligned against. */
export function RegMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("reg-target", className)} aria-hidden="true">
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      <path d="M12 0.5V23.5M0.5 12H23.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Colour control strip: process separations, the spot colour, then key tints. */
export function ColorBar({ className }: { className?: string }) {
  return (
    <div className={cn("colorbar", className)} aria-hidden="true" dir="ltr">
      <span className="cb-c" />
      <span className="cb-m" />
      <span className="cb-y" />
      <span className="cb-k" />
      <span className="cb-s" />
      <span className="cb-80" />
      <span className="cb-60" />
      <span className="cb-40" />
      <span className="cb-20" />
      <span className="cb-5" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section heading                                                     */
/*  Running head in the margin column (desktop), title + lead beside.   */
/* ------------------------------------------------------------------ */

export function SectionHead({
  kicker,
  title,
  lead,
  className,
  as: Tag = "h2",
  size = "section",
}: {
  kicker: string;
  title: string;
  lead?: string;
  className?: string;
  as?: "h1" | "h2";
  size?: "section" | "page";
}) {
  return (
    <div className={cn("sheet items-start", className)}>
      <p className="kicker lg:col-span-3 lg:pt-3">
        <RegMark className="h-3.5 w-3.5 text-accent" />
        {kicker}
      </p>
      <div className="lg:col-span-9">
        <Tag className={cn("display max-w-[16ch]", size === "page" ? "t-page" : "t-section")}>{title}</Tag>
        {lead && <p className="lead measure mt-6 md:mt-8">{lead}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Direction-aware arrow                                               */
/* ------------------------------------------------------------------ */

export function DirArrow({ className }: { className?: string }) {
  const { isRTL } = useApp();
  const Icon = isRTL ? ArrowLeft : ArrowRight;
  return <Icon className={className} strokeWidth={1.8} />;
}
