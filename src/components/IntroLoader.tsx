import { useEffect } from "react";
import { useApp } from "../lib/app";

/**
 * First-visit intro (once per browser session; skipped for reduced motion).
 *
 * Three acts on one small sheet, one per manifesto line:
 *   1. Design       — a pen-tool Bézier draws itself: anchors, handles, crop marks.
 *   2. Engineering  — a blueprint grid sweeps in, the curve is sampled into points,
 *                     code braces close around it.
 *   3. Intelligence — the samples wire into a small network; signals pulse through
 *                     to one output node.
 * Finale: everything collapses into a registration mark whose C/M/Y rings slide
 * into register, then the sheet wipes away and the hero prints in underneath.
 *
 * All motion is CSS; visibility is decided pre-paint by the inline script in
 * index.html (`html.intro-play`). Without that class the overlay never shows, so
 * no-JS, reduced-motion and repeat visits are unaffected. Decorative: aria-hidden.
 */

// Samples along the Bézier M30 150 C60 40 180 40 210 140 (t = 1/8 … 7/8).
const SAMPLES = [
  [45.1, 113.9],
  [66.6, 88],
  [92.2, 72.1],
  [120, 66.2],
  [147.8, 70.2],
  [173.4, 83.9],
  [194.9, 107.2],
] as const;
const HIDDEN = [
  [82, 128],
  [120, 120],
  [158, 128],
] as const;
const OUT = [120, 160] as const;
/** Which samples feed each hidden node. */
const WIRING = [
  [0, 1, 2],
  [2, 3, 4],
  [4, 5, 6],
] as const;
/** Signal routes: sample → hidden → output. */
const PULSES = [
  [1, 0],
  [3, 1],
  [5, 2],
] as const;

const INTRO_MS = 3500;

export default function IntroLoader() {
  const { t } = useApp();

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("intro-play")) return;
    const skip = () => root.classList.add("intro-skip");
    const done = window.setTimeout(() => root.classList.add("intro-done"), INTRO_MS);
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      window.clearTimeout(done);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-stage">
        <svg viewBox="0 0 240 200" className="intro-art" fill="none" direction="ltr">
          {/* Act 2 — blueprint grid */}
          <g className="intro-grid">
            {[40, 70, 100, 130, 160].map((y) => (
              <line key={`h${y}`} x1="12" y1={y} x2="228" y2={y} />
            ))}
            {[30, 60, 90, 120, 150, 180, 210].map((x) => (
              <line key={`v${x}`} x1={x} y1="24" x2={x} y2="176" />
            ))}
          </g>

          <g className="intro-sheet">
            {/* Act 1 — crop marks */}
            <path className="intro-crop" d="M14 30h12M26 18v12M226 30h-12M214 18v12M14 170h12M26 182v-12M226 170h-12M214 182v-12" />

            {/* Act 1 — pen tool: handles, curve, anchors */}
            <path className="intro-handle intro-handle-a" d="M30 150L60 40" />
            <path className="intro-handle intro-handle-b" d="M210 140L180 40" />
            <circle className="intro-knob intro-knob-a" cx="60" cy="40" r="3.2" />
            <circle className="intro-knob intro-knob-b" cx="180" cy="40" r="3.2" />
            <path className="intro-curve" d="M30 150C60 40 180 40 210 140" pathLength={1} />
            <rect className="intro-anchor intro-anchor-a" x="26" y="146" width="8" height="8" />
            <rect className="intro-anchor intro-anchor-b" x="206" y="136" width="8" height="8" />

            {/* Act 2 — code braces */}
            <text className="intro-brace intro-brace-l" x="4" y="116" direction="ltr" unicodeBidi="bidi-override">{"{"}</text>
            <text className="intro-brace intro-brace-r" x="222" y="116" direction="ltr" unicodeBidi="bidi-override">{"}"}</text>

            {/* Act 3 — network edges */}
            <g className="intro-edges">
              {WIRING.flatMap((from, h) =>
                from.map((s) => (
                  <line key={`e${s}-${h}`} x1={SAMPLES[s][0]} y1={SAMPLES[s][1]} x2={HIDDEN[h][0]} y2={HIDDEN[h][1]} />
                ))
              )}
              {HIDDEN.map(([x, y], h) => (
                <line key={`o${h}`} x1={x} y1={y} x2={OUT[0]} y2={OUT[1]} />
              ))}
            </g>
            {PULSES.map(([s, h], i) => (
              <path
                key={`p${i}`}
                className={`intro-pulse intro-pulse-${i}`}
                d={`M${SAMPLES[s][0]} ${SAMPLES[s][1]}L${HIDDEN[h][0]} ${HIDDEN[h][1]}L${OUT[0]} ${OUT[1]}`}
                pathLength={1}
              />
            ))}

            {/* Act 2 — samples (become neurons in act 3) */}
            {SAMPLES.map(([x, y], i) => (
              <circle key={`s${i}`} className={`intro-sample intro-sample-${i}`} cx={x} cy={y} r="3" />
            ))}
            {HIDDEN.map(([x, y], i) => (
              <circle key={`h${i}`} className={`intro-node intro-node-${i}`} cx={x} cy={y} r="4" />
            ))}
            <circle className="intro-out" cx={OUT[0]} cy={OUT[1]} r="6" />
          </g>

          {/* Finale — registration mark, separations sliding into register */}
          <g className="intro-reg">
            <circle className="intro-ring intro-ring-c" cx="120" cy="100" r="22" />
            <circle className="intro-ring intro-ring-m" cx="120" cy="100" r="22" />
            <circle className="intro-ring intro-ring-y" cx="120" cy="100" r="22" />
            <circle className="intro-ring intro-ring-k" cx="120" cy="100" r="22" />
            <circle className="intro-reg-dot" cx="120" cy="100" r="6" />
            <path className="intro-reg-cross" d="M120 64v72M84 100h72" />
          </g>
        </svg>

        <ol className="intro-lines">
          {t.intro.manifesto.map((line, i) => (
            <li key={line} className={`intro-line intro-line-${i}`}>
              {line}
            </li>
          ))}
        </ol>

        <div className="intro-bar">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={`intro-bar-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
