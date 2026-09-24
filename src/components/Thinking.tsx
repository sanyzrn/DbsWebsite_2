import { useApp } from "../lib/app";
import { SectionHead } from "./ui";

/* ------------------------------------------------------------------ */
/*  Process — six stages drawn as a carton dieline: panels joined by    */
/*  dashed fold lines, closed by a glue flap. It is a real sequence, so */
/*  the panels are numbered.                                            */
/* ------------------------------------------------------------------ */

export function Process() {
  const { t, lang } = useApp();
  const steps = t.process.steps;
  const nf = new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US", { minimumIntegerDigits: 2 });

  return (
    <section id="process" className="section-pad border-t border-line bg-surface">
      <div className="wrap">
        <SectionHead kicker={t.process.kicker} title={t.process.title} lead={t.process.lead} />

        <ol className="dieline mt-14 md:mt-20">
          {steps.map((step, i) => (
            <li key={step.en} className="flex flex-col">
              <span className="tnum text-[15px] font-semibold text-accent">{nf.format(i + 1)}</span>
              <h3 className="display mt-6 text-[2rem] leading-none md:mt-20 xl:text-[2.125rem]">{step.title}</h3>
              <p className="mt-3 text-[15px] text-ink2">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
