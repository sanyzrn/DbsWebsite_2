import { useId, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useApp } from "../lib/app";
import { useTypewriter } from "../lib/useTypewriter";
import { DirArrow } from "./ui";

function SloganCycle({ phrases }: { phrases: string[] }) {
  const typed = useTypewriter(phrases);
  const longest = useMemo(
    () => phrases.reduce((best, w) => (w.length > best.length ? w : best), phrases[0] ?? ""),
    [phrases]
  );

  return (
    <span className="inline-flex items-baseline text-hi">
      <span className="relative inline-grid max-w-full">
        <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden="true">
          {longest}
        </span>
        <span className="col-start-1 row-start-1 whitespace-nowrap">{typed}</span>
      </span>
      <span className="typewriter-cursor" aria-hidden="true" />
    </span>
  );
}

/** Soft accent glow + topographic contours + paper grain (static SVG/CSS). */
function HeroAtmosphere() {
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

        {/* Topographic contour lines */}
        <g fill="none" stroke="var(--line2)" strokeWidth="1.1" strokeLinecap="round" className="hero-atmosphere-topo">
          <path d="M-40,160 C180,110 340,210 520,150 S880,70 1240,140" opacity="0.55" />
          <path d="M-40,210 C200,155 360,250 540,190 S900,110 1240,185" opacity="0.45" />
          <path d="M-40,260 C210,200 380,290 560,230 S920,150 1240,230" opacity="0.4" />
          <path d="M-40,315 C220,250 400,335 580,275 S940,195 1240,280" opacity="0.35" />
          <path d="M-40,375 C230,305 420,385 600,325 S960,245 1240,335" opacity="0.3" />
          <path d="M-40,440 C240,365 440,440 620,380 S980,300 1240,395" opacity="0.26" />
          <path d="M-40,510 C250,430 460,500 640,445 S1000,360 1240,460" opacity="0.22" />
          <path d="M-40,585 C260,500 480,565 660,515 S1020,430 1240,530" opacity="0.18" />
          <path d="M80,90 C260,40 420,120 600,70 S960,20 1120,80" stroke="var(--accent)" strokeWidth="1.2" opacity="0.22" />
          <path d="M140,640 C360,580 560,650 760,600 S1040,540 1180,590" stroke="var(--accent)" strokeWidth="1" opacity="0.14" />
        </g>

        {/* Nested organic rings (contour islands) */}
        <g fill="none" stroke="var(--line2)" strokeWidth="1" className="hero-atmosphere-topo">
          <ellipse cx="200" cy="520" rx="90" ry="48" opacity="0.28" />
          <ellipse cx="200" cy="520" rx="60" ry="30" opacity="0.22" />
          <ellipse cx="200" cy="520" rx="32" ry="14" opacity="0.18" />
          <ellipse cx="980" cy="480" rx="110" ry="56" opacity="0.24" />
          <ellipse cx="980" cy="480" rx="72" ry="36" opacity="0.2" />
          <ellipse cx="980" cy="480" rx="38" ry="18" opacity="0.16" />
          <ellipse cx="620" cy="200" rx="70" ry="36" stroke="var(--accent)" opacity="0.16" />
          <ellipse cx="620" cy="200" rx="42" ry="20" stroke="var(--accent)" opacity="0.12" />
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

  return (
    <section id="top" className="relative flex min-h-dvh flex-col overflow-hidden">
      <HeroAtmosphere />

      <div className="wrap relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-8 text-center pt-[96px] pb-10 md:pt-[120px] md:pb-14">
        <div className="hero-in flex justify-center" style={{ animationDelay: "60ms" }}>
          <span className="chip max-w-full border-line2 font-[family-name:Vazirmatn,ui-sans-serif,system-ui,sans-serif] text-ink2">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-hi" strokeWidth={2.2} />
            <span className="truncate">{t.hero.badge}</span>
            <span className="hidden text-ink3 sm:inline">·</span>
            <span className="hidden font-mono text-ink3 sm:inline">{t.hero.badgeStudio}</span>
          </span>
        </div>

        <h1 className="mt-5 text-[36px] font-black leading-[1.15] tracking-tight sm:mt-7 sm:text-[52px] lg:text-[56px] xl:text-[62px] xl:leading-[1.12]">
          <span className="hero-in block" style={{ animationDelay: "140ms" }}>
            {t.hero.name.split(t.hero.nameAccent)[0]}
            <span className="relative inline-block text-hi">
              {t.hero.nameAccent}
              <svg className="absolute -bottom-1.5 start-0 w-full" viewBox="0 0 200 9" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2,7 C60,2 140,2 198,6" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
              </svg>
            </span>
            {t.hero.name.split(t.hero.nameAccent)[1] ?? ""}
          </span>
        </h1>

        <p className="hero-in mx-auto mt-4 max-w-3xl text-[18px] font-extrabold leading-[1.35] tracking-tight text-ink sm:mt-5 sm:text-[22px] md:text-[26px] md:leading-[1.35]" style={{ animationDelay: "240ms" }}>
          {t.hero.sloganA}
          {connector}
          <SloganCycle phrases={t.hero.sloganCycle} />
        </p>

        <p className="hero-in mx-auto mt-5 max-w-4xl text-[14px] leading-7 text-ink2 sm:mt-7 sm:text-[15px] sm:leading-8 md:text-base md:leading-[1.95]" style={{ animationDelay: "340ms" }}>
          {t.hero.body}
        </p>
        <p className="hero-in mx-auto mt-3 max-w-4xl text-[14px] font-semibold leading-7 text-ink sm:mt-4 sm:text-[15px] sm:leading-8 md:text-base md:leading-[1.95]" style={{ animationDelay: "420ms" }}>
          {t.hero.body2}
        </p>

        <div className="hero-in mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-9 sm:gap-3.5" style={{ animationDelay: "500ms" }}>
          <a href="#projects" className="btn btn-primary h-11 px-5 text-[14px] sm:h-[50px] sm:px-[26px] sm:text-[15px]">
            {t.hero.ctaPrimary}
            <DirArrow className="h-[18px] w-[18px]" />
          </a>
          <a href="#about" className="btn btn-ghost h-11 px-5 text-[14px] sm:h-[50px] sm:px-[26px] sm:text-[15px]">
            {t.hero.ctaSecondary}
          </a>
        </div>
      </div>
    </section>
  );
}
