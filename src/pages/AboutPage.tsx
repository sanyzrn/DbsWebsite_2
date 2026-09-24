import { CareerTimeline, Skills } from "../components/About";
import Contact from "../components/Contact";
import { PageMeta } from "../components/PageMeta";
import Testimonials from "../components/Testimonials";
import { CropMarks, SectionHead } from "../components/ui";
import { useApp } from "../lib/app";

/**
 * About + Contact route. Opening statement, the portrait as a framed proof,
 * the question that drove the career, the path itself, skills, then contact.
 */
export default function AboutPage() {
  const { t, lang } = useApp();
  const nf = new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US");

  return (
    <>
      <PageMeta page="about" />
      <section id="about" className="pb-[clamp(72px,9vw,160px)] pt-10 md:pt-16">
        <div className="wrap">
          <SectionHead as="h1" size="page" kicker={t.about.kicker} title={t.about.title} />

          <div className="sheet mt-8 gap-y-10 md:mt-16 lg:mt-24 lg:gap-y-14">
            <figure className="lg:col-span-5">
              <div className="crop">
                <CropMarks />
                <img
                  src="/images/studio.jpg"
                  alt={t.about.studioAlt}
                  width={717}
                  height={717}
                  loading="eager"
                  className="aspect-[4/3] w-full bg-shot object-cover object-[center_25%] sm:aspect-[16/10] lg:aspect-[4/5] lg:object-[center_30%]"
                />
              </div>
              <figcaption className="meta mt-4 lg:mt-6">{t.about.studioNote}</figcaption>
            </figure>

            <div className="lg:col-span-6 lg:col-start-7 lg:pt-4">
              <p className="lead text-ink">{t.about.p1}</p>
              <blockquote className="display t-sub my-8 max-w-[20ch] text-accent md:my-14">{t.about.question}</blockquote>
              <p className="text-[17px] text-ink2">{t.about.p2}</p>
              <p className="mt-8 text-[17px] font-semibold">{t.about.p3}</p>
              <ol className="mt-5 border-t border-line">
                {t.about.checklist.map((item, i) => (
                  <li key={item} className="flex items-baseline gap-5 border-b border-line py-3 text-[17px]">
                    <span className="tnum w-6 shrink-0 text-[14px] font-semibold text-accent">{nf.format(i + 1)}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="sheet mt-14 gap-y-10 border-t border-ink pt-10 md:mt-24 md:pt-16 lg:mt-36 lg:gap-y-14 lg:pt-20">
            <div className="lg:col-span-5">
              <h2 className="display t-section max-w-[14ch]">{t.about.expTitle}</h2>
              <p className="mt-6 max-w-[52ch] text-[17px] text-ink2 lg:mt-8">{t.about.expBody}</p>
              <p className="mt-8 border-s-2 border-accent ps-5 text-[17px] font-semibold">{t.about.expClosing}</p>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 lg:pt-4">
              <CareerTimeline nodes={t.about.path} />
            </div>
          </div>
        </div>
      </section>

      <Skills />

      {/* Testimonials — hidden while there are none */}
      <Testimonials />

      {/* Contact — keeps id="contact" for /about#contact */}
      <Contact />
    </>
  );
}
