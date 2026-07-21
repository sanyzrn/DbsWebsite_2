import { lazy, Suspense, useId } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useApp } from "../lib/app";
import { useMagicDustEnabled, useMagicDustParticleCount } from "../lib/magicDustGate";
import { localePath } from "../lib/paths";
import { useTypewriter } from "../lib/useTypewriter";
import { DirArrow } from "./ui";

const MagicDust = lazy(() =>
  import("./ui/magic-dust-shader").then((m) => ({ default: m.MagicDust }))
);

function SloganCycle({ phrases }: { phrases: string[] }) {
  const typed = useTypewriter(phrases);

  return (
    <span className="text-hi">
      {typed}
      <span className="typewriter-cursor" aria-hidden="true" />
    </span>
  );
}

/** Soft accent glow + topographic contours + paper grain (static SVG/CSS). */
export function HeroAtmosphere() {
  const uid = useId().replace(/:/g, "");
  const blurId = `ha-blur-${uid}`;
  const grainId = `ha-grain-${uid}`;

  return (
    <div className="hero-atmosphere pointer-events-none absolute inset-0" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={blurId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="48" />
          </filter>
          <filter id={grainId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.48  0 0 0 0 0.38  0 0 0 0.55 0" />
          </filter>
          <radialGradient id={`ha-glow-${uid}`} cx="50%" cy="18%" r="55%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="45%" stopColor="var(--soft)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--page)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft layered mesh blobs */}
        <g filter={`url(#${blurId})`} opacity="0.85">
          <ellipse cx="600" cy="120" rx="420" ry="220" fill={`url(#ha-glow-${uid})`} />
          <ellipse cx="220" cy="280" rx="260" ry="180" fill="var(--accent)" opacity="0.08" />
          <ellipse cx="980" cy="240" rx="280" ry="200" fill="var(--soft)" opacity="0.35" />
          <ellipse cx="640" cy="420" rx="340" ry="160" fill="var(--accent)" opacity="0.05" />
        </g>

        {/* Fine paper grain */}
        <rect width="1200" height="900" filter={`url(#${grainId})`} className="hero-atmosphere-grain" />
      </svg>
    </div>
  );
}

export default function Hero() {
  const { t, lang } = useApp();
  const connector = lang === "fa" ? " تا " : " to ";
  // Gates run here — before lazy() mounts — so the WebGL chunk is never fetched when skipped.
  const magicDustEnabled = useMagicDustEnabled();
  const particleCount = useMagicDustParticleCount();

  return (
    <section id="top" className="relative flex min-h-dvh flex-col overflow-hidden">
      {magicDustEnabled && (
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" data-testid="magic-dust-layer">
          <Suspense fallback={null}>
            <MagicDust
              key={particleCount}
              particleColor="#bc9463"
              particleCount={particleCount}
              fontFamily="sans-serif"
              sequence={[
                { type: "text", text: "DBS Studio" },
                { type: "text", text: "Design" },
                { type: "text", text: "GRAPHIC" },
                { type: "text", text: "AI Solutions" },
              ]}
            />
          </Suspense>
        </div>
      )}
      {/* Static paper-texture / glow fallback — always present when WebGL is gated off */}
      <HeroAtmosphere />

      <div className="wrap relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-8 text-center pt-[96px] pb-10 md:pt-[120px] md:pb-14">
        <div className="hero-in hero-in-d60 flex justify-center">
          <span className="chip max-w-full border-line2 font-[family-name:Vazirmatn,ui-sans-serif,system-ui,sans-serif] text-ink2">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-hi" strokeWidth={2.2} />
            <span className="truncate">{t.hero.badge}</span>
            <span className="hidden text-ink3 sm:inline">·</span>
            <span className="hidden font-mono text-ink3 sm:inline">{t.hero.badgeStudio}</span>
          </span>
        </div>

        <h1 className="hero-name mt-5 text-[48px] font-black leading-[1.12] tracking-tight sm:mt-7 sm:text-[64px] sm:leading-[1.1] lg:text-[72px] xl:text-[80px] xl:leading-[1.08]">
          <span className="hero-in hero-in-d140 block">
            {t.hero.name.split(t.hero.nameAccent)[0]}
            <span className="relative inline-block text-hi">
              {t.hero.nameAccent}
              <svg
                className="hero-name-underline absolute -bottom-2 start-0 h-[0.18em] w-full min-h-[9px]"
                viewBox="0 0 200 9"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2,7 C60,2 140,2 198,6"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength={1}
                />
              </svg>
            </span>
            {t.hero.name.split(t.hero.nameAccent)[1] ?? ""}
          </span>
        </h1>

        <p className="hero-slogan hero-in hero-in-d240 mx-auto mt-4 max-w-3xl min-h-[2.7em] text-[18px] font-extrabold leading-[1.35] tracking-tight text-ink sm:mt-5 sm:text-[22px] md:text-[26px] md:leading-[1.35]">
          {t.hero.sloganA}
          {connector}
          <SloganCycle phrases={t.hero.sloganCycle} />
        </p>

        <p className="hero-in hero-in-d340 mx-auto mt-5 max-w-4xl text-[14px] leading-7 text-ink2 sm:mt-7 sm:text-[15px] sm:leading-8 md:text-base md:leading-[1.95]">
          {t.hero.body}
        </p>
        <p className="hero-in hero-in-d420 mx-auto mt-3 max-w-4xl text-[14px] font-semibold leading-7 text-ink sm:mt-4 sm:text-[15px] sm:leading-8 md:text-base md:leading-[1.95]">
          {t.hero.body2}
        </p>

        <div className="hero-in hero-in-d500 mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-9 sm:gap-3.5">
          <Link to={`${localePath(lang, "/")}#projects`} className="btn btn-primary h-11 px-5 text-[14px] sm:h-[50px] sm:px-[26px] sm:text-[15px]">
            {t.hero.ctaPrimary}
            <DirArrow className="h-[18px] w-[18px]" />
          </Link>
          <Link to={localePath(lang, "/about")} className="btn btn-ghost h-11 px-5 text-[14px] sm:h-[50px] sm:px-[26px] sm:text-[15px]">
            {t.hero.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
