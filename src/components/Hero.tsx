import { Award, Boxes, Sparkles, Waypoints } from "lucide-react";
import { useApp } from "../lib/app";
import { DirArrow } from "./ui";

export default function Hero() {
  const { t } = useApp();
  const statIcons = [Award, Boxes, Waypoints];

  return (
    <section id="top" className="relative overflow-hidden pt-[130px] pb-16 md:pt-[168px] md:pb-20">
      <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-40" aria-hidden="true" />

      <div className="wrap relative mx-auto max-w-3xl text-center">
        <div className="hero-in flex justify-center" style={{ animationDelay: "60ms" }}>
          <span className="chip chip-mono border-line2 text-ink2">
            <Sparkles className="h-3.5 w-3.5 text-hi" strokeWidth={2.2} />
            <span>{t.hero.badge}</span>
            <span className="text-ink3">·</span>
            <span className="text-ink3">{t.hero.badgeStudio}</span>
          </span>
        </div>

        <h1 className="mt-7 text-[40px] font-black leading-[1.15] tracking-tight sm:text-[52px] lg:text-[56px] xl:text-[62px] xl:leading-[1.12]">
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

        <p className="hero-in mx-auto mt-5 max-w-xl text-[22px] font-extrabold leading-[1.35] tracking-tight text-ink md:text-[26px] md:leading-[1.35]" style={{ animationDelay: "240ms" }}>
          {t.hero.sloganA}{" "}
          <span className="text-hi">
            {t.hero.sloganB.split(t.hero.sloganAccent)[0]}
            {t.hero.sloganAccent}
            {t.hero.sloganB.split(t.hero.sloganAccent)[1] ?? ""}
          </span>
        </p>

        <p className="hero-in mx-auto mt-7 max-w-xl text-[15px] leading-8 text-ink2 md:text-base md:leading-[1.95]" style={{ animationDelay: "340ms" }}>
          {t.hero.body}
        </p>
        <p className="hero-in mx-auto mt-4 max-w-xl text-[15px] font-semibold leading-8 text-ink md:text-base md:leading-[1.95]" style={{ animationDelay: "420ms" }}>
          {t.hero.body2}
        </p>

        <div className="hero-in mt-9 flex flex-wrap items-center justify-center gap-3.5" style={{ animationDelay: "500ms" }}>
          <a href="#projects" className="btn btn-primary">
            {t.hero.ctaPrimary}
            <DirArrow className="h-[18px] w-[18px]" />
          </a>
          <a href="#about" className="btn btn-ghost">
            {t.hero.ctaSecondary}
          </a>
        </div>

        <div className="hero-in mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-5 border-t border-line pt-8 sm:gap-8" style={{ animationDelay: "600ms" }}>
          {t.hero.stats.map((s, i) => {
            const Icon = statIcons[i];
            return (
              <div key={i} className="group flex flex-col items-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-sm border border-line text-hi transition-colors duration-300 group-hover:border-hi">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </div>
                <div className="text-[22px] font-black leading-none tracking-tight md:text-[26px]">{s.value}</div>
                <div className="mt-2 text-[11.5px] font-medium leading-5 text-ink2">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
