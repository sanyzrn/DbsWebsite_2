import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { NexaChatDemo } from "../components/nexachat/NexaChatDemo";
import { SectionHead } from "../components/ui";
import { useApp } from "../lib/app";
import { NEXACHAT_BUY_URL, NEXACHAT_COPY, type NexaChatCopy } from "../lib/nexachat/copy";
import { localePath } from "../lib/paths";
import "./nexachat.css";

function CardGrid({ title, items, kicker }: { title: string; items: NexaChatCopy["features"]["items"]; kicker: string }) {
  return (
    <section className="nexachat-block" aria-labelledby={`nc-${kicker}`}>
      <div className="sheet">
        <h2 id={`nc-${kicker}`} className="nexachat-block__title lg:col-span-3">
          {title}
        </h2>
        <ul className="nexachat-cards lg:col-span-9">
          {items.map((item) => (
            <li key={item.name}>
              <h3>{item.name}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function NexaChatPage() {
  const { lang } = useApp();
  const c = NEXACHAT_COPY[lang];
  const report = `${localePath(lang, "/issues")}?product=nexachatai`;

  return (
    <>
      <PageMeta page="nexachat" />
      <section className="pb-[clamp(56px,8vw,120px)] pt-10 md:pt-16">
        <div className="wrap">
          <SectionHead as="h1" size="page" kicker={c.kicker} title={c.title} lead={c.lead} />
          <div className="sheet mt-8 md:mt-12">
            <div className="flex flex-wrap items-center gap-4 lg:col-span-9 lg:col-start-4">
              <a className="btn btn-primary" href={NEXACHAT_BUY_URL} target="_blank" rel="noopener noreferrer">
                {c.ctaBuy}
              </a>
              <a className="btn btn-ghost" href="#demo">
                {c.ctaDemo}
              </a>
              <Link className="link text-[15px] font-semibold" to={report}>
                {c.ctaReport}
              </Link>
            </div>
            <p className="text-[14px] text-ink3 lg:col-span-9 lg:col-start-4" dir="auto">
              {c.versionLine}
            </p>
          </div>

          <section id="demo" className="nexachat-block" aria-labelledby="nc-demo-title">
            <div className="sheet">
              <div className="lg:col-span-3">
                <h2 id="nc-demo-title" className="nexachat-block__title">
                  {c.demo.title}
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-ink2">{c.demo.lead}</p>
                <p className="mt-4 text-[13px] leading-6 text-ink3">{c.demo.note}</p>
              </div>
              <div className="lg:col-span-9">
                <NexaChatDemo lang={lang} tryLabel={c.demo.tryLabel} loadingLabel={c.demo.loading} failedLabel={c.demo.failed} />
              </div>
            </div>
          </section>

          <CardGrid kicker="features" title={c.features.title} items={c.features.items} />
          <CardGrid kicker="for" title={c.forWho.title} items={c.forWho.items} />
          <CardGrid kicker="steps" title={c.steps.title} items={c.steps.items} />

          <section className="nexachat-block" aria-labelledby="nc-needs">
            <div className="sheet">
              <h2 id="nc-needs" className="nexachat-block__title lg:col-span-3">
                {c.needs.title}
              </h2>
              <ul className="nexachat-list lg:col-span-9">
                {c.needs.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="nexachat-block" aria-labelledby="nc-faq">
            <div className="sheet">
              <h2 id="nc-faq" className="nexachat-block__title lg:col-span-3">
                {c.faq.title}
              </h2>
              <div className="lg:col-span-9">
                {c.faq.items.map((item) => (
                  <details key={item.q} className="nexachat-faq">
                    <summary>{item.q}</summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="nexachat-block nexachat-closing">
            <div className="sheet">
              <div className="lg:col-span-9 lg:col-start-4">
                <h2 className="display t-sub">{c.closing.title}</h2>
                <p className="lead measure mt-4">{c.closing.text}</p>
                <a className="btn btn-primary mt-8" href={NEXACHAT_BUY_URL} target="_blank" rel="noopener noreferrer">
                  {c.ctaBuy}
                </a>
              </div>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
