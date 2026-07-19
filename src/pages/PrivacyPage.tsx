import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { Reveal } from "../components/ui";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";

export default function PrivacyPage() {
  const { t, lang } = useApp();
  const copy = t.privacy;

  return (
    <>
      <PageMeta page="privacy" />
      <section className="section-pad border-t border-line bg-surface">
        <div className="wrap max-w-3xl">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-ink3">{copy.kicker}</p>
            <h1 className="mt-3 text-[32px] font-extrabold tracking-tight text-ink md:text-[40px]">{copy.title}</h1>
            <p className="mt-4 text-[13px] text-ink3">{copy.updated}</p>
          </Reveal>

          <div className="mt-10 space-y-8">
            {copy.sections.map((section) => (
              <Reveal key={section.heading}>
                <h2 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink3">
                  {section.heading}
                </h2>
                <p className="text-[15px] leading-8 text-ink2">{section.body}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12">
            <Link to={localePath(lang, "/")} className="text-[14px] font-semibold text-hi transition-colors hover:underline">
              {t.notFound.home}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
