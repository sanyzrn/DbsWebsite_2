import { Code2, Compass, Palette, Sparkles } from "lucide-react";
import { useApp } from "../lib/app";
import { DirArrow, Reveal, SectionHead, SnapCarousel } from "./ui";

const cardIcons = [Palette, Code2, Sparkles, Compass];

export default function Expertise() {
  const { t } = useApp();

  return (
    <section id="expertise" className="section-pad border-t border-line bg-surface">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHead kicker={t.expertise.kicker} title={t.expertise.title} lead={t.expertise.lead} />
          <Reveal delay={200}>
            <span className="hidden font-mono text-[11px] tracking-widest text-ink3 lg:block" dir="ltr">
              04 — capabilities
            </span>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <SnapCarousel
            className="mt-8 sm:mt-10 md:mt-12"
            label={t.expertise.kicker}
            gridClassName="md:grid-cols-2 xl:grid-cols-4"
            itemClassName="h-full"
          >
            {t.expertise.cards.map((card, i) => {
              const Icon = cardIcons[i];
              return (
                <article
                  key={card.en}
                  className="group relative flex h-full flex-col rounded-lg border border-line bg-page p-7 transition-all duration-400 hover:-translate-y-1.5 hover:border-hi/60"
                >
                  <div className="mb-8 flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-sm border border-line bg-surface text-hi transition-all duration-300 group-hover:border-hi group-hover:bg-hi group-hover:text-page">
                      <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
                    </span>
                    <span className="font-mono text-xs font-semibold text-ink3">0{i + 1}</span>
                  </div>

                  <h3 className="text-[21px] font-extrabold tracking-tight">{card.title}</h3>
                  <span className="mt-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink3" dir="ltr">
                    {card.en}
                  </span>
                  <p className="mt-4 flex-1 text-[13.5px] leading-7 text-ink2">{card.desc}</p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span key={tag} className="chip text-[11px]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href="#skills"
                    className="mt-7 inline-flex items-center gap-2 border-t border-line pt-5 text-[12.5px] font-bold text-ink2 transition-colors duration-300 group-hover:text-hi"
                  >
                    {t.expertise.more}
                    <DirArrow className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
                  </a>

                  <span
                    className="pointer-events-none absolute -bottom-5 end-3 select-none font-mono text-[110px] font-bold leading-none text-ink opacity-[0.04] transition-opacity duration-500 group-hover:opacity-[0.08]"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                </article>
              );
            })}
          </SnapCarousel>
        </Reveal>
      </div>
    </section>
  );
}
