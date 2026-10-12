import { MARK_ACCENT, MARK_EYES, MARK_INK, MARK_VIEWBOX } from "./brand";

/**
 * The Nex octopus: one mind, a thousand connections.
 *
 * The outline and the right eye take `currentColor`, and the blue arm and eye
 * `--nx-mark-accent`, so one mark serves a light page, a dark one and the blue
 * app tile alike.
 */
export default function NexMark({ className = "", title, alive = false }: { className?: string; title?: string; alive?: boolean }) {
  const accent = "var(--nx-mark-accent, #0084f7)";
  return (
    <svg className={className} viewBox={`0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {MARK_INK.map((d) => <path key={d.slice(0, 12)} fill="currentColor" d={d} />)}
      <path className={alive ? "nex-live-arm" : undefined} fill={accent} d={MARK_ACCENT} />
      <g className={alive ? "nex-live-eyes" : undefined}>
        <circle fill={accent} cx={MARK_EYES.blue.x} cy={MARK_EYES.blue.y} r={MARK_EYES.r} />
        <circle fill="currentColor" cx={MARK_EYES.ink.x} cy={MARK_EYES.ink.y} r={MARK_EYES.r} />
      </g>
    </svg>
  );
}
