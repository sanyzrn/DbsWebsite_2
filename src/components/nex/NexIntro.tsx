import { useEffect, useId, type CSSProperties } from "react";
import { CircleCheck, Clock3, Image, Lightbulb, Mic, UserRound, type LucideIcon } from "lucide-react";
import "./nex-intro.css";
import { MARK_ACCENT, MARK_EYES, MARK_INK, MARK_VIEWBOX, WORD_DOT, WORD_E, WORD_N, WORD_SWOOSH, WORD_VIEWBOX, WORD_X } from "./brand";

/**
 * The Nex loading intro: the app's splash screen, told once more on the web.
 *
 * It opens on the two eyes; the blue one blinks. The octopus grows out from
 * between them, and six scattered pieces of a day — a thought, a photo, a
 * person, a task, a moment, a voice — are each pulled in along a thread to an
 * arm, rippling where they join. The mark makes room, "nex" rises letter by
 * letter, its blue stroke sweeps through and the dot drops in, the tagline
 * follows, a pulse leaves the eyes, and the page opens from them.
 *
 * All motion is CSS (`nex-intro.css`); whether it plays is decided pre-paint by
 * the inline script in index.html (`html.nex-intro-play`: first visit to /nex
 * this session, motion allowed). Without that class the overlay never shows,
 * so no-JS, reduced-motion and repeat visits go straight to the page. A tap or
 * a key skips it. Decorative: aria-hidden.
 */

const INTRO_MS = 3100;
const SKIP_MS = 300;

/** The mark is drawn this wide, in CSS pixels; the geometry below follows. */
const MARK_PX = 132;
/** How far out each piece starts, in CSS pixels. */
const REACH_PX = 54;

const EYES = { x: (MARK_EYES.blue.x + MARK_EYES.ink.x) / 2, y: MARK_EYES.blue.y };
const CENTRE = { x: MARK_VIEWBOX.width / 2, y: MARK_VIEWBOX.height / 2 };

/** Each piece, and the point on the octopus that catches it (in mark units), as in the app. */
const FRAGMENTS: { icon: LucideIcon; x: number; y: number }[] = [
  { icon: Lightbulb, x: 118, y: 24 },
  { icon: Image, x: 49, y: 95 },
  { icon: UserRound, x: 187, y: 95 },
  { icon: CircleCheck, x: 24, y: 222 },
  { icon: Clock3, x: 212, y: 222 },
  { icon: Mic, x: 70, y: 248 },
];

const pct = (value: number, of: number) => `${((value / of) * 100).toFixed(3)}%`;

export default function NexIntro({ tagline }: { tagline: string }) {
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("nex-intro-play")) return;
    let done = window.setTimeout(() => root.classList.add("nex-intro-done"), INTRO_MS);
    const skip = () => {
      root.classList.add("nex-intro-skip");
      window.clearTimeout(done);
      done = window.setTimeout(() => root.classList.add("nex-intro-done"), SKIP_MS);
    };
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      window.clearTimeout(done);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  const scale = MARK_PX / MARK_VIEWBOX.width;
  const reach = REACH_PX / scale;
  const viewBox = `0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`;
  const eyes = { "--nxi-eye-x": pct(EYES.x, MARK_VIEWBOX.width), "--nxi-eye-y": pct(EYES.y, MARK_VIEWBOX.height) } as CSSProperties;

  return (
    <div className="nex-intro" aria-hidden="true">
      <div className="nex-intro-stage" dir="ltr">
        <div className="nex-intro-figure" style={eyes}>
          <span className="nex-intro-ring" />
          <span className="nex-intro-pulse" />
          <span className="nex-intro-pulse nex-intro-pulse-late" />
          <svg className="nex-intro-body" viewBox={viewBox}>
            {MARK_INK.map((d) => <path key={d.slice(0, 12)} d={d} />)}
            <path className="nex-intro-accent" d={MARK_ACCENT} />
          </svg>
          <svg className="nex-intro-threads" viewBox={viewBox}>
            {FRAGMENTS.map((f, i) => {
              const dx = f.x - CENTRE.x;
              const dy = f.y - CENTRE.y;
              const length = Math.hypot(dx, dy);
              const from = { x: f.x + (dx / length) * reach, y: f.y + (dy / length) * reach };
              const style = { "--nxi-i": i } as CSSProperties;
              return <g key={i} style={style}>
                <path className="nex-intro-thread" d={`M${from.x.toFixed(1)} ${from.y.toFixed(1)}L${f.x} ${f.y}`} pathLength={1} />
                <circle className="nex-intro-ripple" cx={f.x} cy={f.y} r="17" />
              </g>;
            })}
          </svg>
          <svg className="nex-intro-eyes" viewBox={viewBox}>
            <circle className="nex-intro-eye-blue" cx={MARK_EYES.blue.x} cy={MARK_EYES.blue.y} r={MARK_EYES.r} />
            <circle className="nex-intro-eye-ink" cx={MARK_EYES.ink.x} cy={MARK_EYES.ink.y} r={MARK_EYES.r} />
          </svg>
          {FRAGMENTS.map(({ icon: Icon, x, y }, i) => {
            const dx = x - CENTRE.x;
            const dy = y - CENTRE.y;
            const length = Math.hypot(dx, dy);
            const style = {
              "--nxi-i": i,
              left: pct(x, MARK_VIEWBOX.width),
              top: pct(y, MARK_VIEWBOX.height),
              "--nxi-ox": `${((dx / length) * REACH_PX).toFixed(1)}px`,
              "--nxi-oy": `${((dy / length) * REACH_PX).toFixed(1)}px`,
            } as CSSProperties;
            return <span key={i} className="nex-intro-fragment" style={style}><Icon size={15} strokeWidth={1.8} /></span>;
          })}
        </div>
        <svg className="nex-intro-word" viewBox={`0 0 ${WORD_VIEWBOX.width} ${WORD_VIEWBOX.height}`}>
          <defs>
            <clipPath id={`${id}-sweep`}><rect className="nex-intro-sweep" x="540" y="0" width="360" height={WORD_VIEWBOX.height} /></clipPath>
          </defs>
          <path className="nex-intro-letter nex-intro-n" d={WORD_N} />
          <path className="nex-intro-letter nex-intro-e" d={WORD_E} />
          <g className="nex-intro-letter nex-intro-x">{WORD_X.map((d) => <path key={d.slice(0, 12)} d={d} />)}</g>
          <path className="nex-intro-accent" d={WORD_SWOOSH} clipPath={`url(#${id}-sweep)`} />
          <circle className="nex-intro-accent nex-intro-dot" cx={WORD_DOT.x} cy={WORD_DOT.y} r={WORD_DOT.r} />
        </svg>
        <p className="nex-intro-tagline" dir="auto">{tagline}</p>
      </div>
    </div>
  );
}
