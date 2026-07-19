import { useApp } from "../lib/app";
import { Reveal, SectionHead } from "./ui";

/* ------------------------------------------------------------------ */
/*  Process — compact connected pathway (renders after Projects on home) */
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
