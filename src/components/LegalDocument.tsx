import { Link } from "react-router-dom";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";
import { SectionHead } from "./ui";

type LegalCopy = {
  kicker: string;
  title: string;
  updated: string;
  sections: readonly { heading: string; body: string }[];
};

/** Shared layout for Privacy and Terms: numbered clauses in a reading column. */
export function LegalDocument({ copy }: { copy: LegalCopy }) {
  const { t, lang } = useApp();
  const nf = new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US");

  return (
    <section className="pb-[clamp(72px,9vw,160px)] pt-10 md:pt-16">
      <div className="wrap">
        <SectionHead as="h1" size="page" kicker={copy.kicker} title={copy.title} lead={copy.updated} />

        <div className="sheet mt-14 md:mt-20">
          <div className="border-t border-rule lg:col-span-7 lg:col-start-4">
            {copy.sections.map((section, i) => (
              <section key={section.heading} className="grid grid-cols-[2.5rem_minmax(0,1fr)] border-b border-line py-8">
                <span className="tnum pt-1 text-[15px] font-semibold text-accent">{nf.format(i + 1)}</span>
                <div>
                  <h2 className="text-[20px] font-semibold">{section.heading}</h2>
                  <p className="mt-3 text-[17px] leading-relaxed text-ink2">{section.body}</p>
                </div>
              </section>
            ))}
            <Link to={localePath(lang, "/")} className="link mt-10 inline-block font-semibold">
              {t.notFound.home}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
