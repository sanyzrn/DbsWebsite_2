import { WORD_DOT, WORD_E, WORD_N, WORD_SWOOSH, WORD_VIEWBOX, WORD_X } from "./brand";

/**
 * The "nex" wordmark, with its blue stroke and dot.
 *
 * The letters take `currentColor`, and the blue parts `--nx-mark-accent`, so
 * one mark serves a light page, a dark one and the blue app tile alike.
 */
export default function NexWordmark({ className = "", title }: { className?: string; title?: string }) {
  const accent = "var(--nx-mark-accent, #0084f7)";
  return (
    <svg className={className} viewBox={`0 0 ${WORD_VIEWBOX.width} ${WORD_VIEWBOX.height}`} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path fill="currentColor" d={WORD_N} />
      <path fill="currentColor" d={WORD_E} />
      <path fill={accent} d={WORD_SWOOSH} />
      {WORD_X.map((d) => <path key={d.slice(0, 12)} fill="currentColor" d={d} />)}
      <circle fill={accent} cx={WORD_DOT.x} cy={WORD_DOT.y} r={WORD_DOT.r} />
    </svg>
  );
}
