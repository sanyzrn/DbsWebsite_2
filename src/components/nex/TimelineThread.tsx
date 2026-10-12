import { useEffect, useRef } from "react";
import type { Lang } from "../../lib/i18n";

const FALLBACK = "M500 0C500 220 220 200 220 450S780 650 780 950S220 1150 220 1450S780 1650 780 1950S500 2150 500 2500";

/** Scroll is passive: one frame updates an SVG, never React state or document layout. */
export default function TimelineThread({ lang }: { lang: Lang }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const baseRef = useRef<SVGPathElement>(null);
  const inkRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const base = baseRef.current;
    const ink = inkRef.current;
    const tip = tipRef.current;
    const timeline = svg?.parentElement;
    if (!svg || !base || !ink || !tip || !timeline || typeof ink.getTotalLength !== "function") return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let length = 0;
    let visible = true;
    let disposed = false;

    function paint() {
      frame = 0;
      if (!length || !visible || disposed) return;
      const rect = timeline!.getBoundingClientRect();
      const y = Math.max(0, Math.min(rect.height, window.innerHeight * .72 - rect.top));
      // Invert the monotonic vertical path so the pen follows the reading position,
      // including the wide desktop bends, rather than assuming a linear path length.
      let low = 0;
      let high = length;
      for (let i = 0; i < 14; i++) {
        const mid = (low + high) / 2;
        if (ink!.getPointAtLength(mid).y < y) low = mid;
        else high = mid;
      }
      const distance = calm.matches ? length : (y === 0 ? 0 : y === rect.height ? length : (low + high) / 2);
      ink!.style.strokeDashoffset = String(1000 * (1 - distance / length));
      const point = ink!.getPointAtLength(distance);
      tip!.setAttribute("cx", String(point.x));
      tip!.setAttribute("cy", String(point.y));
      svg!.dataset.progress = (distance / length).toFixed(3);
      svg!.dataset.calm = String(calm.matches);
    }

    function schedule() {
      if (!frame && visible && !disposed) frame = requestAnimationFrame(paint);
    }

    function measure() {
      if (disposed) return;
      const width = timeline!.clientWidth;
      const height = timeline!.clientHeight;
      if (!width || !height) return;
      const compact = width < 580;
      const rtl = getComputedStyle(timeline!).direction === "rtl";
      const elements = [...timeline!.querySelectorAll<HTMLElement>(".nex-day-heading, .nex-day-notes > .nex-card, .nex-draft, .nex-vault-slot, .nex-yesterday-notes > .nex-card, .nex-origin-world")];
      const points = elements.map((element) => {
        // Offset coordinates ignore hover/scroll transforms and avoid a moving path.
        let x = element.offsetWidth / 2;
        let y = Math.min(element.offsetHeight / 2, 90);
        let current: HTMLElement | null = element;
        while (current && current !== timeline) {
          x += current.offsetLeft;
          y += current.offsetTop;
          current = current.offsetParent as HTMLElement | null;
        }
        return { x: compact ? (rtl ? width - 2 : 2) : x, y };
      }).sort((a, b) => a.y - b.y);
      const nodes = [{ x: points[0]?.x ?? width / 2, y: 0 }, ...points, { x: points.at(-1)?.x ?? width / 2, y: height }];
      let d = `M${nodes[0].x} 0`;
      for (let i = 1; i < nodes.length; i++) {
        const a = nodes[i - 1];
        const b = nodes[i];
        const middle = (a.y + b.y) / 2;
        d += `C${a.x} ${middle} ${b.x} ${middle} ${b.x} ${b.y}`;
      }
      svg!.setAttribute("viewBox", `0 0 ${width} ${height}`);
      base!.setAttribute("d", d);
      ink!.setAttribute("d", d);
      length = ink!.getTotalLength();
      svg!.dataset.measured = "true";
      schedule();
    }

    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resize?.observe(timeline);
    const intersection = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    intersection?.observe(timeline);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    calm.addEventListener("change", schedule);
    measure();
    void document.fonts?.ready.then(measure);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize?.disconnect();
      intersection?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      calm.removeEventListener("change", schedule);
    };
  }, [lang]);

  return <svg ref={svgRef} className="nex-timeline-thread" viewBox="0 0 1000 2500" preserveAspectRatio="none" fill="none" aria-hidden="true">
    <path ref={baseRef} className="nex-thread-guide" d={FALLBACK} />
    <path ref={inkRef} className="nex-thread-ink" pathLength="1000" d={FALLBACK} />
    <circle ref={tipRef} className="nex-thread-tip" cx="500" cy="0" r="4" />
  </svg>;
}
