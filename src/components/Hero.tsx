import { Award, Boxes, Sparkles, Waypoints } from "lucide-react";
import { useApp } from "../lib/app";
import { DirArrow } from "./ui";

export default function Hero() {
  const { t } = useApp();
  const statIcons = [Award, Boxes, Waypoints];

  return (
    <section id="top" className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

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
          {t.hero.sloganA}{" "}
          <span className="text-hi">
            {t.hero.sloganB.split(t.hero.sloganAccent)[0]}
            {t.hero.sloganAccent}
            {t.hero.sloganB.split(t.hero.sloganAccent)[1] ?? ""}
          </span>
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

        <div className="hero-in mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3 border-t border-line pt-6 sm:mt-12 sm:gap-8 sm:pt-8" style={{ animationDelay: "600ms" }}>
          {t.hero.stats.map((s, i) => {
            const Icon = statIcons[i];
            return (
              <div key={i} className="group flex flex-col items-center">
                <div className="mb-2 hidden h-10 w-10 items-center justify-center rounded-sm border border-line text-hi transition-colors duration-300 group-hover:border-hi sm:mb-3 sm:flex">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </div>
                <div className="text-[20px] font-black leading-none tracking-tight md:text-[26px]">{s.value}</div>
                <div className="mt-1.5 text-[10.5px] font-medium leading-4 text-ink2 sm:mt-2 sm:text-[11.5px] sm:leading-5">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
