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
      <div className="wrap grid items-start gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-6">
          <SectionHead kicker={t.thinking.kicker} title={t.thinking.title} />
          <Reveal delay={200}>
            <p className="mt-5 max-w-lg text-[15px] font-semibold leading-7 sm:mt-7 sm:text-[16px] sm:leading-[1.95]">{t.thinking.lead}</p>
          </Reveal>
          <Reveal delay={280}>
            <p className="mt-3 max-w-lg text-[14px] leading-7 text-ink2 sm:mt-4 sm:text-[15px] sm:leading-[1.95]">{t.thinking.intro2}</p>
          </Reveal>
          <Reveal delay={360}>
            <div className="mt-6 inline-flex items-center gap-3 sm:mt-9 sm:gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-hi text-hi sm:h-12 sm:w-12">
                <MoveDown className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <span className="text-[16px] font-black tracking-tight sm:text-[19px] md:text-[22px]">{t.thinking.closing}</span>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-6">
          <Reveal delay={150}>
            <div className="relative rounded-lg border border-line bg-surface p-5 sm:p-7 md:p-9">
              <span className="absolute -top-3 start-5 rounded-xs bg-hi px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-page sm:-top-3.5 sm:start-7 sm:px-3 sm:text-[10px]" dir="ltr">
                {isRTL ? "پرسش‌های اول" : "first questions"}
              </span>
              {t.thinking.questions.map((q, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-3 border-b border-line py-3.5 transition-colors duration-300 last:border-b-0 last:pb-0 first:pt-0 hover:border-hi/50 sm:items-center sm:gap-5 sm:py-5"
                >
                  <span className="mt-0.5 font-mono text-[11px] font-bold text-hi sm:mt-0" dir="ltr">
                    Q{i + 1}
                  </span>
                  <span className="mt-2.5 hidden h-px w-6 bg-line2 transition-all duration-300 group-hover:w-9 group-hover:bg-hi sm:mt-0 sm:block" />
                  <span className="text-[14px] font-bold leading-7 sm:text-[16px] sm:leading-8 md:text-[17px]">{q}</span>
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
/*  Process — compact connected pathway                                 */
/* ------------------------------------------------------------------ */

export function Process() {
  const { t } = useApp();
  const steps = t.process.steps;

  return (
    <section id="process" className="relative overflow-hidden border-t border-line bg-surface py-14 md:py-16 lg:py-20">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.22]" aria-hidden="true" />

      <div className="wrap relative">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <SectionHead kicker={t.process.kicker} title={t.process.title} lead={t.process.lead} />
          <Reveal delay={160}>
            <p className="hidden font-mono text-[11px] tracking-[0.18em] text-ink3 lg:block" dir="ltr">
              01 → 06 · continuous path
            </p>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <ol className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:mt-10 lg:mt-12 lg:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.en} className="group relative bg-surface p-3.5 transition-colors duration-300 hover:bg-page sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-page font-mono text-[10px] font-bold text-ink3 transition-all duration-300 group-hover:border-hi group-hover:bg-hi group-hover:text-page sm:h-8 sm:w-8 sm:text-[11px]"
                    dir="ltr"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px min-w-2 flex-1 bg-line2 transition-colors duration-300 group-hover:bg-hi/40" aria-hidden="true" />
                  <span className="truncate font-mono text-[8px] uppercase tracking-[0.12em] text-ink3 sm:text-[9px] sm:tracking-[0.16em]" dir="ltr">
                    {step.en}
                  </span>
                </div>
                <h3 className="mt-2.5 text-[14px] font-extrabold tracking-tight sm:mt-4 sm:text-[17px] md:text-[18px]">{step.title}</h3>
                <p className="mt-1 text-[11.5px] leading-5 text-ink2 sm:mt-2 sm:text-[12.5px] sm:leading-6 md:text-[13px] md:leading-6">{step.desc}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

