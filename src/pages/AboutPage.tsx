import { Check, Layers } from "lucide-react";
import { CareerTimeline, Skills } from "../components/About";
import Contact from "../components/Contact";
import { HeroAtmosphere } from "../components/Hero";
import { PageMeta } from "../components/PageMeta";
import { Reveal, SectionHead } from "../components/ui";
import { useApp } from "../lib/app";

/**
 * Combined About + Contact route.
 * Opening + studio hero are page-specific; path timeline / skills reuse About + Skills.
 */
export default function AboutPage() {
  const { t } = useApp();

  return (
    <>
      <PageMeta page="about" />
      {/* 1–2. Strong opening + prominent studio image */}
      <section id="about" className="section-pad border-t border-line bg-surface">
        <div className="wrap">
          <SectionHead kicker={t.about.kicker} title={t.about.title} />

          <Reveal delay={80}>
            <figure className="relative mt-8 overflow-hidden rounded-lg border border-line sm:mt-10 sm:rounded-xl">
              <img
                src="/images/studio.jpg"
                alt={t.about.title}
                loading="eager"
                className="aspect-[16/9] w-full object-cover transition-transform duration-[1200ms] hover:scale-[1.02] md:aspect-[21/9]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-16 sm:p-6 sm:pt-24" dir="ltr">
                <span className="inline-flex items-center gap-2.5">
                  <img src="/Dbs_logo_single.webp" alt="" className="h-5 w-5 object-contain" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/80 sm:text-[10px] sm:tracking-[0.2em]">
                    DBSGraphic — creative & product studio
                  </span>
                </span>
              </div>
              <span
                className="absolute end-3 top-3 rounded-xs border border-white/25 bg-black/30 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/85 backdrop-blur sm:end-4 sm:top-4 sm:px-2.5"
                dir="ltr"
              >
                since 2008
              </span>
            </figure>
          </Reveal>

          <div className="mx-auto mt-10 max-w-3xl md:mt-14">
            <Reveal delay={160}>
              <p className="text-[15px] leading-8 text-ink2 sm:text-[16px] sm:leading-[1.95] md:text-[17px]">{t.about.p1}</p>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-6 text-[20px] font-black leading-[1.55] tracking-tight text-hi sm:text-[24px] sm:leading-[1.7] md:text-[28px]">
                {t.about.question}
              </p>
            </Reveal>
            <Reveal delay={280}>
              <p className="mt-6 text-[15px] leading-8 text-ink2 sm:text-[16px] sm:leading-[1.95]">{t.about.p2}</p>
            </Reveal>
            <Reveal delay={340}>
              <p className="mt-6 text-[15px] font-bold leading-8 sm:text-[16px]">{t.about.p3}</p>
            </Reveal>
            {/* PLACEHOLDER — Saeed can add 1–2 more personal paragraphs here later. */}
            <Reveal delay={400}>
              <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {t.about.checklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[14.5px] font-semibold sm:text-[15px]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-hi/50 bg-hi/10 text-hi">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={460}>
              <p className="mt-8 inline-flex items-center gap-2.5 rounded-sm border border-line bg-page px-4 py-3 text-[12.5px] font-semibold text-ink2">
                <Layers className="h-4 w-4 text-hi" />
                {t.about.studioNote}
              </p>
            </Reveal>
          </div>

          {/* Career path timeline */}
          <div className="mt-14 grid gap-10 border-t border-line pt-12 md:mt-20 md:gap-12 md:pt-16 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <Reveal>
                <h2 className="text-[22px] font-extrabold leading-[1.3] tracking-tight sm:text-[26px] md:text-[32px]">{t.about.expTitle}</h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-4 max-w-xl text-[14px] leading-7 text-ink2 sm:mt-6 sm:text-[15px] sm:leading-[1.95]">{t.about.expBody}</p>
              </Reveal>
              <Reveal delay={200}>
                <p className="mt-5 max-w-xl rounded-sm border-s-[3px] border-hi bg-page px-4 py-3 text-[14px] font-bold leading-7 sm:mt-7 sm:px-5 sm:py-4 sm:text-[15px] sm:leading-8">
                  {t.about.expClosing}
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={160}>
                <CareerTimeline nodes={t.about.path} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Skills / expertise breakdown */}
      <Skills />

      {/* 4. Atmosphere divider between About and Contact */}
      <div className="relative h-28 overflow-hidden border-t border-line md:h-40" aria-hidden="true">
        <div className="absolute inset-0 opacity-70">
          <HeroAtmosphere />
        </div>
      </div>

      {/* 5. Contact — keep id="contact" for /about#contact */}
      <Contact />
    </>
  );
}
