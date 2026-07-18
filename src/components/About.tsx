import { Check, Layers } from "lucide-react";
import { useApp } from "../lib/app";
import { cn } from "../utils/cn";
import { Reveal, SectionHead } from "./ui";

/* ------------------------------------------------------------------ */
/*  About                                                               */
/* ------------------------------------------------------------------ */

export default function About() {
  const { t } = useApp();

  return (
    <section id="about" className="section-pad border-t border-line bg-surface">
      <div className="wrap">
        <div className="grid gap-14 lg:grid-cols-12">
          {/* portrait / studio image */}
          <div className="lg:col-span-5">
            <Reveal className="lg:sticky lg:top-28">
              <figure className="relative overflow-hidden rounded-xl border border-line">
                <img
                  src="/images/studio.jpg"
                  alt={t.about.title}
                  loading="lazy"
                  className="aspect-[20/23] w-full object-cover transition-transform duration-[1200ms] hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5 pt-16" dir="ltr">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/80">
                    DBSGraphic — creative & product studio
                  </span>
                </div>
                <span className="absolute end-4 top-4 rounded-xs border border-white/25 bg-black/30 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/85 backdrop-blur" dir="ltr">
                  since 2008
                </span>
              </figure>
            </Reveal>
          </div>

          {/* story */}
          <div className="lg:col-span-7">
            <SectionHead kicker={t.about.kicker} title={t.about.title} />
            <Reveal delay={200}>
              <p className="mt-7 max-w-2xl text-[15px] leading-[1.95] text-ink2">{t.about.p1}</p>
            </Reveal>
            <Reveal delay={260}>
              <p className="mt-6 max-w-2xl text-[20px] font-black leading-[1.7] tracking-tight text-hi md:text-[24px]">
                {t.about.question}
              </p>
            </Reveal>
            <Reveal delay={320}>
              <p className="mt-6 max-w-2xl text-[15px] leading-[1.95] text-ink2">{t.about.p2}</p>
            </Reveal>
            <Reveal delay={380}>
              <p className="mt-8 max-w-2xl text-[15px] font-bold leading-8">{t.about.p3}</p>
            </Reveal>
            <Reveal delay={440}>
              <ul className="mt-4 grid max-w-2xl gap-x-8 gap-y-3 sm:grid-cols-2">
                {t.about.checklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[14.5px] font-semibold">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-hi/50 bg-hi/10 text-hi">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={500}>
              <p className="mt-9 inline-flex items-center gap-2.5 rounded-sm border border-line bg-page px-4 py-3 text-[12.5px] font-semibold text-ink2">
                <Layers className="h-4 w-4 text-hi" />
                {t.about.studioNote}
              </p>
            </Reveal>
          </div>
        </div>

        {/* ------------------------------ experience ------------------------------ */}
        <div className="mt-24 grid gap-12 border-t border-line pt-16 lg:grid-cols-12 md:pt-20">
          <div className="lg:col-span-6">
            <Reveal>
              <h3 className="text-[26px] font-extrabold leading-[1.3] tracking-tight md:text-[32px]">{t.about.expTitle}</h3>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 max-w-xl text-[15px] leading-[1.95] text-ink2">{t.about.expBody}</p>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-7 max-w-xl rounded-sm border-s-[3px] border-hi bg-page px-5 py-4 text-[15px] font-bold leading-8">
                {t.about.expClosing}
              </p>
            </Reveal>
          </div>

          {/* evolution path */}
          <div className="lg:col-span-6">
            <div className="relative">
              <span className="absolute bottom-6 start-[7px] top-2 w-px bg-line2" aria-hidden="true" />
              {t.about.path.map((node, i) => {
                const last = i === t.about.path.length - 1;
                return (
                  <Reveal key={node} delay={i * 110}>
                    <div className="group relative flex items-start gap-6 pb-9 ps-8 last:pb-0">
                      <span
                        className={cn(
                          "absolute start-0 top-1.5 h-[15px] w-[15px] rounded-full border-[3px] transition-colors duration-300",
                          last ? "border-hi bg-hi" : "border-line2 bg-page group-hover:border-hi"
                        )}
                        aria-hidden="true"
                      />
                      <div className="flex flex-1 flex-wrap items-baseline justify-between gap-2 rounded-sm border border-line bg-page px-5 py-4 transition-colors duration-300 hover:border-hi/60">
                        <span className={cn("text-[15.5px] font-bold", last && "text-hi")}>{node}</span>
                        <span className="font-mono text-[11px] font-semibold tracking-wider text-ink3">{t.about.pathYears[i]}</span>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Skills                                                              */
/* ------------------------------------------------------------------ */

export function Skills() {
  const { t } = useApp();

  return (
    <section id="skills" className="section-pad border-t border-line">
      <div className="wrap">
        <SectionHead kicker={t.skills.kicker} title={t.skills.title} lead={t.skills.lead} />

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {t.skills.cats.map((cat, i) => (
            <Reveal key={cat.en} delay={i * 90} className="h-full">
              <div className="h-full rounded-lg border border-line bg-surface p-7 transition-colors duration-400 hover:border-hi/50">
                <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-line pb-5">
                  <h3 className="text-[19px] font-extrabold tracking-tight">{cat.title}</h3>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink3" dir="ltr">
                    {cat.en}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span key={item} className={cn("chip chip-hover", cat.mono && "chip-mono")}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
