import { Code2, PenTool, Sparkles } from "lucide-react";
import { useApp } from "../lib/app";
import { Reveal } from "./ui";

const manifestoIcons = [PenTool, Code2, Sparkles];

export default function Intro() {
  const { t } = useApp();

  return (
    <>
      {/* ------------------------------- marquee ------------------------------- */}
      <div className="border-y border-line bg-surface py-5" aria-label={t.marquee.label}>
        <div className="wrap mb-3 flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-[2px] bg-hi" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">{t.marquee.label}</span>
        </div>
        <div dir="ltr" className="marquee-pause overflow-hidden" aria-hidden="true">
          <div className="marquee-track flex w-max items-center">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center">
                {t.marquee.items.map((item, i) => (
                  <span key={`${copy}-${i}`} className="flex items-center">
                    <span
                      className={
                        item === "DBSGraphic"
                          ? "px-8 font-mono text-[15px] font-bold tracking-[0.22em] text-hi"
                          : "px-8 font-mono text-[15px] font-medium tracking-[0.08em] text-ink2 transition-colors"
                      }
                    >
                      {item}
                    </span>
                    <span className="h-1.5 w-1.5 rotate-45 bg-line2" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------- intro ------------------------------- */}
      <section className="section-pad">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <span className="kicker">{t.intro.kicker}</span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 text-[30px] font-extrabold leading-[1.2] tracking-tight md:text-[40px] md:leading-[1.2]">
                {t.intro.title}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 text-[15px] leading-[1.95] text-ink2">{t.intro.p1}</p>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-4 text-[15px] leading-[1.95] text-ink2">{t.intro.p2}</p>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-7 rounded-sm border-s-[3px] border-hi bg-surface px-5 py-4 text-[15px] font-bold leading-8">
                {t.intro.strong}
              </p>
            </Reveal>
          </div>

          {/* manifesto */}
          <div className="lg:col-span-7">
            <div className="flex h-full flex-col justify-center">
              {t.intro.manifesto.map((line, i) => {
                const Icon = manifestoIcons[i];
                return (
                  <Reveal key={i} delay={i * 120}>
                    <div className="group flex items-center gap-6 border-b border-line py-7 transition-colors duration-300 first:border-t hover:border-hi/50 md:gap-10 md:py-9">
                      <span className="font-mono text-sm font-semibold text-ink3 transition-colors duration-300 group-hover:text-hi">
                        0{i + 1}
                      </span>
                      <span className="flex-1 text-[24px] font-black leading-snug tracking-tight md:text-[36px] lg:text-[40px]">
                        {line}
                      </span>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-line text-ink2 transition-all duration-300 group-hover:border-hi group-hover:bg-hi group-hover:text-page md:h-14 md:w-14">
                        <Icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.8} />
                      </span>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
