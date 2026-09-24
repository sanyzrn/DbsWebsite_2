import { useState } from "react";
import { useApp } from "../lib/app";
import { cn } from "../utils/cn";
import { SectionHead, Slider } from "./ui";

/** Each discipline is printed as one separation: C, M, Y and the Reflex Blue spot. */
const PLATES = [
  { swatch: "bg-plate-c", fill: "var(--plate-c)", cx: 78, cy: 80 },
  { swatch: "bg-plate-m", fill: "var(--plate-m)", cx: 122, cy: 80 },
  { swatch: "bg-plate-y", fill: "var(--plate-y)", cx: 78, cy: 124 },
  { swatch: "bg-accent", fill: "var(--accent)", cx: 122, cy: 124 },
] as const;

function Separations({ active, label }: { active: number | null; label: string }) {
  return (
    <svg
      viewBox="0 0 200 204"
      className="plates h-auto w-full"
      role="img"
      aria-label={label}
      data-active={active ?? undefined}
    >
      {PLATES.map((p, i) => (
        <circle key={i} className={`pl-${i}`} cx={p.cx} cy={p.cy} r="54" fill={p.fill} />
      ))}
      {/* Registration target the plates align on */}
      <g stroke="var(--ink)" strokeWidth="0.8" fill="none" aria-hidden="true">
        <circle cx="100" cy="102" r="5" />
        <path d="M100 90v24M88 102h24" />
      </g>
    </svg>
  );
}

/**
 * Introduction + the four disciplines. Anchored as `#expertise` for nav/hash links.
 */
export default function Intro() {
  const { t } = useApp();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="expertise" className="section-pad border-t border-line">
      <div className="wrap">
        <SectionHead kicker={t.intro.kicker} title={t.intro.title} />

        <div className="sheet mt-8 md:mt-14 lg:mt-20">
          <div className="lg:col-span-5 lg:col-start-4">
            <p className="lead text-ink">{t.intro.p1}</p>
            <p className="mt-5 text-ink2">{t.intro.p2}</p>
            <p className="display t-sub mt-10 max-w-[22ch] text-accent">{t.intro.strong}</p>
            <p className="mt-8 border-s-2 border-rule ps-5 text-ink2">{t.thinking.lead}</p>
          </div>
          <figure className="mt-2 flex items-center gap-5 lg:col-span-4 lg:mt-0 lg:flex-col lg:items-end lg:gap-4">
            <div className="w-32 shrink-0 sm:w-44 lg:w-full lg:max-w-[360px]">
              <Separations active={active} label={t.expertise.platesLabel} />
            </div>
            <figcaption className="meta max-w-[34ch] lg:text-end">{t.expertise.platesCaption}</figcaption>
          </figure>
        </div>

        <div className="mt-12 lg:mt-24 lg:border-t lg:border-rule" onMouseLeave={() => setActive(null)}>
          <Slider label={t.nav.expertise} desktopClassName="lg:flex-col lg:gap-0">
            {t.expertise.cards.map((card, i) => (
              <div
                key={card.en}
                onMouseEnter={() => setActive(i)}
                className="discipline flex w-full flex-col gap-4 rounded-[6px] border border-line2 bg-surface2 p-6 lg:grid lg:grid-cols-12 lg:items-baseline lg:gap-8 lg:rounded-none lg:border-0 lg:border-b lg:border-line lg:bg-transparent lg:px-0 lg:py-9"
              >
                <div className="flex items-center gap-4 lg:col-span-3">
                  <span className={cn("swatch h-4 w-4 shrink-0 rounded-full", PLATES[i]?.swatch)} aria-hidden="true" />
                  <h3 className="display text-[2rem] leading-none md:text-[2.5rem]">{card.title}</h3>
                </div>
                <p className="max-w-[52ch] text-[17px] text-ink lg:col-span-5 lg:col-start-4">{card.desc}</p>
                <p className="meta mt-auto lg:col-span-4 lg:mt-0 lg:text-end">{card.tags.join(", ")}</p>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}
