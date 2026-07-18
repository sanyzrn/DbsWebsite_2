import { MoveDown } from "lucide-react";
import { useApp } from "../lib/app";
import { Reveal, SectionHead } from "./ui";

/* ------------------------------------------------------------------ */
/*  Product thinking                                                    */
/* ------------------------------------------------------------------ */

export function Thinking() {
  const { t, isRTL } = useApp();

  return (
    <section className="section-pad border-t border-line">
      <div className="wrap grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionHead kicker={t.thinking.kicker} title={t.thinking.title} />
          <Reveal delay={200}>
            <p className="mt-7 max-w-lg text-[16px] font-semibold leading-[1.95]">{t.thinking.lead}</p>
          </Reveal>
          <Reveal delay={280}>
            <p className="mt-4 max-w-lg text-[15px] leading-[1.95] text-ink2">{t.thinking.intro2}</p>
          </Reveal>
          <Reveal delay={360}>
            <div className="mt-9 inline-flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-hi text-hi">
                <MoveDown className="h-5 w-5" />
              </span>
              <span className="text-[19px] font-black tracking-tight md:text-[22px]">{t.thinking.closing}</span>
            </div>
          </Reveal>
        </div>

        {/* question stack */}
        <div className="lg:col-span-6">
          <Reveal delay={150}>
            <div className="relative rounded-lg border border-line bg-surface p-7 md:p-9">
              <span className="absolute -top-3.5 start-7 rounded-xs bg-hi px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-page" dir="ltr">
                {isRTL ? "پرسش‌های اول" : "first questions"}
              </span>
              {t.thinking.questions.map((q, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-5 border-b border-line py-5 transition-colors duration-300 last:border-b-0 last:pb-0 first:pt-0 hover:border-hi/50"
                >
                  <span className="font-mono text-[11px] font-bold text-hi" dir="ltr">
                    Q{i + 1}
                  </span>
                  <span className="h-px w-6 bg-line2 transition-all duration-300 group-hover:w-9 group-hover:bg-hi" />
                  <span className="text-[16px] font-bold leading-8 md:text-[17px]">{q}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Process                                                             */
/* ------------------------------------------------------------------ */

export function Process() {
  const { t } = useApp();

  return (
    <section id="process" className="section-pad border-t border-line bg-surface">
      <div className="wrap">
        <SectionHead kicker={t.process.kicker} title={t.process.title} lead={t.process.lead} />

        <div className="mt-16">
          {t.process.steps.map((step, i) => (
            <Reveal key={step.en} delay={i * 60}>
              <div className="group grid grid-cols-[auto_1fr] items-baseline gap-5 border-t border-line py-7 transition-colors duration-300 last:border-b hover:border-hi/40 md:grid-cols-[110px_1fr_1.2fr] md:gap-10 md:py-9">
                <span className="font-mono text-[26px] font-bold leading-none text-ink3/60 transition-colors duration-300 group-hover:text-hi md:text-[34px]" dir="ltr">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[20px] font-extrabold tracking-tight md:text-[24px]">{step.title}</h3>
                  <span className="mt-1 block font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink3" dir="ltr">
                    {step.en}
                  </span>
                </div>
                <p className="col-span-2 mt-1 text-[14px] leading-8 text-ink2 md:col-span-1 md:mt-0 md:max-w-md">
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
