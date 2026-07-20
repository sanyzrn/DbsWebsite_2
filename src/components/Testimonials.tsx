import { Link } from "react-router-dom";
import { Reveal, SectionHead, SnapCarousel } from "./ui";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";
import {
  getLocalizedTestimonials,
  type LocalizedTestimonial,
} from "../lib/testimonials";

function TestimonialCard({ item }: { item: LocalizedTestimonial }) {
  const { lang, t } = useApp();
  const isDirect = item.quoteType === "direct";
  const projectHref = item.relatedProjectSlug
    ? localePath(lang, `/projects/${item.relatedProjectSlug}`)
    : null;

  return (
    <article
      data-testid={`testimonial-${item.quoteType}`}
      className="flex h-full flex-col border border-line bg-surface p-5 sm:p-6"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink3">
        {isDirect ? t.testimonials.directLabel : t.testimonials.outcomeLabel}
      </p>

      {isDirect ? (
        <blockquote className="mt-3 flex-1 text-[15px] font-medium leading-7 text-ink sm:text-[16px] sm:leading-8">
          <span aria-hidden="true" className="text-hi">
            “
          </span>
          {item.quote}
          <span aria-hidden="true" className="text-hi">
            ”
          </span>
        </blockquote>
      ) : (
        <p className="mt-3 flex-1 border-s-[3px] border-hi/70 ps-3 text-[15px] font-semibold leading-7 text-ink sm:text-[16px] sm:leading-8">
          {item.quote}
        </p>
      )}

      <footer className="mt-5 border-t border-line pt-4">
        <cite className="block text-[13px] font-semibold not-italic text-ink2 sm:text-[14px]">
          {item.attribution}
        </cite>
        {projectHref && (
          <Link
            to={projectHref}
            className="mt-2 inline-flex text-[12px] font-semibold text-hi underline-offset-4 hover:underline"
          >
            {t.testimonials.relatedProject}
          </Link>
        )}
      </footer>
    </article>
  );
}

/**
 * Social-proof section above Contact.
 * Returns null when there are zero published testimonials — no empty-state box.
 */
export default function Testimonials() {
  const { lang, t } = useApp();
  const items = getLocalizedTestimonials(lang);

  if (items.length === 0) return null;

  return (
    <section
      id="testimonials"
      data-testid="testimonials-section"
      className="section-pad border-t border-line bg-page"
    >
      <div className="wrap">
        <SectionHead
          kicker={t.testimonials.kicker}
          title={t.testimonials.title}
          lead={t.testimonials.lead}
        />

        <Reveal delay={80}>
          <div data-testid="testimonials-carousel" className="mt-8 md:hidden">
            <SnapCarousel label={t.testimonials.title} itemClassName="flex h-full">
              {items.map((item) => (
                <TestimonialCard key={item.id} item={item} />
              ))}
            </SnapCarousel>
          </div>

          <div
            data-testid="testimonials-grid"
            className="mt-8 hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((item, i) => (
              <Reveal key={item.id} delay={100 + i * 60}>
                <TestimonialCard item={item} />
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
