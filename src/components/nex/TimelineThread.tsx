import { useEffect, useId, useRef } from "react";
import type { Lang } from "../../lib/i18n";

/** Decorative desktop connections: passive scroll, one frame, no React/layout updates. */
export default function TimelineThread({ lang }: { lang: Lang }) {
  const clipId = `nex-thread-${useId().replace(/:/g, "")}`;
  const revealRef = useRef<SVGRectElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const baseRef = useRef<SVGPathElement>(null);
  const inkRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGGElement>(null);
  const nodesRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const reveal = revealRef.current;
    const svg = svgRef.current;
    const base = baseRef.current;
    const ink = inkRef.current;
    const glow = glowRef.current;
    const tip = tipRef.current;
    const ports = nodesRef.current;
    const timeline = svg?.parentElement;
    if (!reveal || !svg || !base || !ink || !glow || !tip || !ports || !timeline || typeof ink.getTotalLength !== "function") return;
    const desktop = window.matchMedia("(min-width: 821px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stopDesktop: (() => void) | undefined;

    function startDesktop() {
      let frame = 0;
      let length = 0;
      let visible = true;
      let disposed = false;
      let lastY = 0;
      let portNodes: SVGCircleElement[] = [];

      function paint() {
        frame = 0;
        if (!length || disposed) return;
        const rect = timeline!.getBoundingClientRect();
        const y = Math.max(0, Math.min(rect.height, window.innerHeight * .72 - rect.top));
        // Each connection moves downward, including the empty interval between days.
        let low = 0;
        let high = length;
        for (let i = 0; i < 14; i++) {
          const mid = (low + high) / 2;
          if (ink!.getPointAtLength(mid).y < y) low = mid;
          else high = mid;
        }
        const distance = calm.matches || y >= lastY ? length : y === 0 ? 0 : (low + high) / 2;
        // A vertical reveal keeps separate days sequential. SVG dash offsets reset
        // at each subpath and would otherwise draw both days at the same time.
        reveal!.setAttribute("height", String(calm.matches ? rect.height : y));
        const point = ink!.getPointAtLength(distance);
        tip!.setAttribute("transform", `translate(${point.x} ${point.y})`);
        // Hide the pen during chapter gaps and while it is behind a card edge.
        tip!.dataset.active = String(distance > 0 && distance < length && Math.abs(point.y - y) < 24);
        for (const port of portNodes) port.dataset.reached = String(calm.matches || Number(port.getAttribute("cy")) <= y);
        svg!.dataset.progress = (distance / length).toFixed(3);
        svg!.dataset.calm = String(calm.matches);
      }

      function refresh() {
        if (!frame && !disposed) frame = requestAnimationFrame(paint);
      }
      function schedule() { if (visible) refresh(); }

      function measure() {
        if (disposed) return;
        const width = timeline!.clientWidth;
        const height = timeline!.clientHeight;
        if (!width || !height) return;
        let d = "";
        const allPoints: { x: number; y: number }[] = [];
        for (const group of timeline!.querySelectorAll<HTMLElement>(".nex-day-notes, .nex-yesterday-notes")) {
          const cards = [...group.querySelectorAll<HTMLElement>(":scope > .nex-card, :scope > .nex-local-stage > .nex-draft")];
          const points = cards.map((card) => {
            // Layout coordinates stay stable during scroll arrival and hover effects.
            let left = 0;
            let top = 0;
            let current: HTMLElement | null = card;
            while (current && current !== timeline) {
              left += current.offsetLeft;
              top += current.offsetTop;
              current = current.offsetParent as HTMLElement | null;
            }
            const facingRight = left + card.offsetWidth / 2 < width / 2;
            let x = facingRight ? card.offsetWidth + 6 : -6;
            let y = Math.min(card.offsetHeight / 2, 160);
            // Follow the card's rotation, but ignore its independent arrival translate.
            const style = getComputedStyle(card);
            if (typeof DOMMatrix !== "undefined" && style.transform !== "none") {
              const matrix = new DOMMatrix(style.transform);
              const [ox, oy] = style.transformOrigin.split(" ").map(parseFloat);
              const dx = x - ox;
              const dy = y - oy;
              x = ox + matrix.a * dx + matrix.c * dy + matrix.e;
              y = oy + matrix.b * dx + matrix.d * dy + matrix.f;
            }
            return { x: left + x, y: top + y, facingRight };
          }).sort((a, b) => a.y - b.y);
          if (points.length < 2) continue;
          allPoints.push(...points);
          d += `M${points[0].x} ${points[0].y}`;
          for (let i = 1; i < points.length; i++) {
            const a = points[i - 1];
            const b = points[i];
            const middleY = (a.y + b.y) / 2;
            // Leave/enter horizontally at a port, then turn through the open gutter.
            const reach = Math.min(38, width * .035, a.facingRight !== b.facingRight ? Math.abs(a.x - b.x) / 2 : Infinity);
            const ax = a.x + (a.facingRight ? reach : -reach);
            const bx = b.x + (b.facingRight ? reach : -reach);
            const centerX = (ax + bx) / 2;
            d += `C${ax} ${a.y} ${centerX} ${a.y} ${centerX} ${middleY}C${centerX} ${b.y} ${bx} ${b.y} ${b.x} ${b.y}`;
          }
        }
        if (!d) { svg!.dataset.measured = "false"; return; }
        svg!.setAttribute("viewBox", `0 0 ${width} ${height}`);
        reveal!.setAttribute("width", String(width));
        for (const path of [base!, ink!, glow!]) path.setAttribute("d", d);
        ports!.replaceChildren();
        portNodes = allPoints.map(({ x, y }) => {
          const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          node.setAttribute("cx", String(x));
          node.setAttribute("cy", String(y));
          node.setAttribute("r", "3.5");
          ports!.append(node);
          return node;
        });
        lastY = allPoints.at(-1)!.y;
        length = ink!.getTotalLength();
        svg!.dataset.measured = "true";
        refresh();
      }

      const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
      resize?.observe(timeline!);
      const intersection = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        refresh();
      });
      intersection?.observe(timeline!);
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", measure);
      calm.addEventListener("change", refresh);
      measure();
      void document.fonts?.ready.then(measure);
      return () => {
        disposed = true;
        cancelAnimationFrame(frame);
        resize?.disconnect();
        intersection?.disconnect();
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", measure);
        calm.removeEventListener("change", refresh);
      };
    }

    function syncViewport() {
      stopDesktop?.();
      stopDesktop = undefined;
      svg!.dataset.measured = "false";
      svg!.dataset.progress = "0.000";
      if (desktop.matches) stopDesktop = startDesktop();
    }
    desktop.addEventListener("change", syncViewport);
    syncViewport();
    return () => { stopDesktop?.(); desktop.removeEventListener("change", syncViewport); };
  }, [lang]);

  return <svg ref={svgRef} className="nex-timeline-thread" viewBox="0 0 1000 2500" preserveAspectRatio="none" fill="none" aria-hidden="true">
    <defs><clipPath id={clipId} clipPathUnits="userSpaceOnUse"><rect ref={revealRef} width="1000" height="0" /></clipPath></defs>
    <path ref={baseRef} className="nex-thread-guide" />
    <path ref={glowRef} className="nex-thread-glow" clipPath={`url(#${clipId})`} />
    <path ref={inkRef} className="nex-thread-ink" clipPath={`url(#${clipId})`} />
    <g ref={nodesRef} className="nex-thread-ports" />
    <g ref={tipRef} className="nex-thread-tip"><circle className="nex-thread-aura" r="10" /><circle r="3.5" /></g>
  </svg>;
}
