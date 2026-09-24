import { Link } from "react-router-dom";
import { SectionHead } from "./ui";
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
    <article data-testid={`testimonial-${item.quoteType}`} className="border-t border-rule pt-8">
      <p className="meta">{isDirect ? t.testimonials.directLabel : t.testimonials.outcomeLabel}</p>
      {isDirect ? (
        <blockquote className="display t-sub mt-5 max-w-[28ch]">
          <span aria-hidden="true" className="text-accent">“</span>
          {item.quote}
          <span aria-hidden="true" className="text-accent">”</span>
        </blockquote>
      ) : (
        <p className="mt-5 max-w-[48ch] text-[20px] font-semibold leading-snug">{item.quote}</p>
      )}
      <footer className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-2">
        <cite className="text-[15px] not-italic text-ink2">{item.attribution}</cite>
        {projectHref && (
          <Link to={projectHref} className="link text-[14px] font-semibold">
            {t.testimonials.relatedProject}
          </Link>
        )}
      </footer>
    </article>
  );
}

/**
 * Social proof above Contact. Returns null when there are zero published
 * testimonials — no empty-state box.
 */
export default function Testimonials() {
  const { lang, t } = useApp();
  const items = getLocalizedTestimonials(lang);

  if (items.length === 0) return null;

  return (
    <section id="testimonials" data-testid="testimonials-section" className="section-pad border-t border-line">
      <div className="wrap">
        <SectionHead kicker={t.testimonials.kicker} title={t.testimonials.title} lead={t.testimonials.lead} />
        <div className="sheet mt-14 md:mt-20">
          <div data-testid="testimonials-grid" className="grid gap-14 md:grid-cols-2 lg:col-span-9 lg:col-start-4">
            {items.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
