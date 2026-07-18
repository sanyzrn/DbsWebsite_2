import { useEffect, useRef, useState, type ReactNode } from "react";
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
        <h2 className="mt-5 text-[30px] font-extrabold leading-[1.2] tracking-tight md:text-[42px] md:leading-[1.18]">
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={160}>
          <p className="mt-4 text-[15px] leading-8 text-ink2 md:text-base md:leading-8">{lead}</p>
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
