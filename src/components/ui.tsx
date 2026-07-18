import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useApp } from "../lib/app";
import { cn } from "../utils/cn";

/* ------------------------------------------------------------------ */
/*  Scroll reveal wrapper                                               */
/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={cn("reveal", inView && "in", className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section heading                                                     */
/* ------------------------------------------------------------------ */

export function SectionHead({
  kicker,
  title,
  lead,
  className,
}: {
  kicker: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <Reveal>
        <span className="kicker">{kicker}</span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mt-4 text-[26px] font-extrabold leading-[1.25] tracking-tight sm:mt-5 sm:text-[30px] md:text-[42px] md:leading-[1.18]">
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={160}>
          <p className="mt-3 text-[14px] leading-7 text-ink2 sm:mt-4 sm:text-[15px] sm:leading-8 md:text-base">{lead}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Direction-aware arrow                                               */
/* ------------------------------------------------------------------ */

export function DirArrow({ className }: { className?: string }) {
  const { isRTL } = useApp();
  const Icon = isRTL ? ArrowLeft : ArrowRight;
  return <Icon className={className} strokeWidth={2.2} />;
}

/* ------------------------------------------------------------------ */
/*  Mobile snap carousel → md+ grid                                     */
/* ------------------------------------------------------------------ */

export function SnapCarousel({
  children,
  label,
  className,
  itemClassName,
  gridClassName,
}: {
  children: ReactNode;
  label: string;
  className?: string;
  itemClassName?: string;
  /** Applied from the `md` breakpoint (grid replaces the carousel). */
  gridClassName?: string;
}) {
  const items = Children.toArray(children);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

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
      { root, threshold: [0.55, 0.7, 0.85] }
    );

    slides.forEach((slide) => io.observe(slide));
    return () => io.disconnect();
  }, [items.length]);

  const goTo = (i: number) => {
    const root = scrollerRef.current;
    const slide = root?.children[i] as HTMLElement | undefined;
    if (!root || !slide) return;
    // Prefer scrollLeft math so the page itself doesn't shift vertically.
    const rootRect = root.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    const delta = slideRect.left + slideRect.width / 2 - (rootRect.left + rootRect.width / 2);
    root.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className={cn("overflow-x-clip", className)}>
      <div
        ref={scrollerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        className={cn(
          "flex gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth snap-x snap-mandatory",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "-mx-5 scroll-px-5 px-5",
          "md:mx-0 md:grid md:gap-5 md:overflow-visible md:scroll-px-0 md:px-0 md:snap-none",
          gridClassName
        )}
      >
        {items.map((child, i) => (
          <div
            key={i}
            className={cn(
              "w-[min(82vw,320px)] shrink-0 snap-center self-stretch",
              "md:w-auto md:min-w-0 md:shrink md:snap-align-none",
              itemClassName
            )}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${items.length}`}
          >
            {child}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5 md:hidden" role="tablist" aria-label={label}>
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${i + 1} / ${items.length}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-5 bg-hi" : "w-1.5 bg-line2 hover:bg-ink3"
              )}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
