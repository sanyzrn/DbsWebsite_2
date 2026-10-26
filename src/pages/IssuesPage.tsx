import { IssueForm } from "../components/issues/IssueForm";
import { PageMeta } from "../components/PageMeta";
import { RegMark } from "../components/ui";
import { useApp } from "../lib/app";

export default function IssuesPage() {
  const { t } = useApp();
  const c = t.issues;

  return (
    <>
      <PageMeta page="issues" />
      <section id="issues" className="pb-[clamp(72px,9vw,160px)] pt-10 md:pt-16">
        <div className="wrap">
          <div className="sheet">
            <p className="kicker lg:col-span-3 lg:pt-3">
              <RegMark className="h-3.5 w-3.5 text-accent" />
              {c.kicker}
            </p>
            <div className="lg:col-span-9">
              <h1 className="display t-page max-w-[12ch]">{c.title}</h1>
              <p className="lead measure mt-6 md:mt-8">{c.lead}</p>
            </div>
          </div>

          <div className="sheet mt-8 gap-y-10 md:mt-14 lg:mt-20">
            <div className="lg:col-span-6 lg:col-start-4">
              <div className="border-t border-rule pt-8">
                <h2 className="text-[22px] font-semibold">{c.form.title}</h2>
                <p className="mt-2 max-w-[52ch] text-[15px] text-ink2">{c.form.desc}</p>
                <div className="mt-8">
                  <IssueForm idPrefix="issue-page" />
                </div>
              </div>
            </div>
            <aside className="lg:col-span-3 lg:col-start-10">
              <p className="text-[17px] font-semibold">{c.strong}</p>
              <ul className="mt-6 border-t border-line">
                {c.lines.map((line) => (
                  <li key={line} className="border-b border-line py-4 text-[16px] text-ink2">
                    {line}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
