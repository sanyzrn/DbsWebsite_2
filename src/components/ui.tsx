import { Children, useEffect, useRef, useState, type ReactNode } from "react";
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
        {lead && <p className="lead measure mt-4 md:mt-8">{lead}</p>}
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

/* ------------------------------------------------------------------ */
/*  Slider — swipeable scroll-snap track below lg, normal layout above  */
/*  Mobile reads one card at a time instead of a long stack; desktop    */
/*  keeps whatever layout `desktopClassName` gives the track.           */
/* ------------------------------------------------------------------ */

export function Slider({
  children,
  label,
  className,
  desktopClassName,
  slideClassName,
}: {
  children: ReactNode;
  /** Accessible name for the carousel region. */
  label: string;
  className?: string;
  /** lg+ layout for the track (e.g. "lg:flex-col lg:gap-36" or "lg:grid-cols-6"). */
  desktopClassName?: string;
  /** Width/extra classes per slide below lg. */
  slideClassName?: string;
}) {
  const { lang } = useApp();
  const items = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const nf = new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US");

  useEffect(() => {
    const root = trackRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const slides = Array.from(root.children);
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        const next = slides.indexOf(best.target);
        if (next >= 0) setIndex(next);
      },
      { root, threshold: [0.6, 0.8] }
    );
    slides.forEach((slide) => io.observe(slide));
    return () => io.disconnect();
  }, [items.length]);

  const goTo = (i: number) => {
    const root = trackRef.current;
    const slide = root?.children[i] as HTMLElement | undefined;
    if (!root || !slide) return;
    // Horizontal-only scroll so the page never jumps vertically; works in RTL too.
    const delta = slide.getBoundingClientRect().left - root.getBoundingClientRect().left;
    root.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className={className}>
      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        className={cn(
          "slider-track -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 md:-mx-10 md:scroll-px-10 md:px-10",
          "lg:mx-0 lg:snap-none lg:overflow-visible lg:px-0",
          desktopClassName
        )}
      >
        {items.map((child, i) => (
          <div
            key={i}
            aria-roledescription="slide"
            aria-label={`${nf.format(i + 1)} / ${nf.format(items.length)}`}
            className={cn("flex w-[84%] shrink-0 snap-start md:w-[62%] lg:w-auto lg:shrink", slideClassName)}
          >
            {child}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-5 flex items-center justify-between gap-4 lg:hidden">
          <div className="flex items-center gap-1">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${nf.format(i + 1)} / ${nf.format(items.length)}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => goTo(i)}
                className="group flex h-8 min-w-6 items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-300",
                    i === index ? "w-6 bg-accent" : "w-1.5 bg-line2 group-hover:bg-ink3"
                  )}
                />
              </button>
            ))}
          </div>
          <p className="meta tnum" aria-hidden="true">
            {nf.format(index + 1)} / {nf.format(items.length)}
          </p>
        </div>
      )}
    </div>
  );
}
