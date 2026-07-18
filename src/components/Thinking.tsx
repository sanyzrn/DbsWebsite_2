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
          <ol className="mt-9 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:mt-10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.en} className="group relative bg-surface p-5 transition-colors duration-300 hover:bg-page md:p-6">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-page font-mono text-[11px] font-bold text-ink3 transition-all duration-300 group-hover:border-hi group-hover:bg-hi group-hover:text-page"
                    dir="ltr"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-line2 transition-colors duration-300 group-hover:bg-hi/40" aria-hidden="true" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink3" dir="ltr">
                    {step.en}
                  </span>
                </div>
                <h3 className="mt-4 text-[17px] font-extrabold tracking-tight md:text-[18px]">{step.title}</h3>
                <p className="mt-2 text-[12.5px] leading-6 text-ink2 md:text-[13px] md:leading-6">{step.desc}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

