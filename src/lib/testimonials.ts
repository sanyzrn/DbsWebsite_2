import type { Lang } from "./i18n";

/** Bilingual string used in content/testimonials/*.json */
export type LocaleText = { fa: string; en: string };

export type TestimonialQuoteType = "direct" | "outcome-statement";
export type TestimonialStatus = "published" | "draft";

/**
 * Canonical testimonial schema.
 * Runtime shape is enforced by `scripts/testimonial-content.mjs` (Zod) at build time.
 * Do not invent quotes or names — leave content/testimonials/ empty until real entries exist.
 */
export type TestimonialContent = {
  id: string;
  quoteType: TestimonialQuoteType;
  quote: LocaleText;
  attribution: LocaleText;
  /** Optional link to a project slug when the proof relates to a specific engagement. */
  relatedProjectSlug?: string;
  status: TestimonialStatus;
};

/** Locale-resolved testimonial used by the UI. */
export type LocalizedTestimonial = {
  id: string;
  quoteType: TestimonialQuoteType;
  quote: string;
  attribution: string;
  relatedProjectSlug?: string;
};

const modules = import.meta.glob("../../content/testimonials/*.json", {
  eager: true,
  import: "default",
}) as Record<string, TestimonialContent>;

function requireTestimonial(filePath: string, raw: TestimonialContent): TestimonialContent {
  if (
    !raw?.id ||
    !raw.quoteType ||
    !raw.quote?.fa ||
    !raw.quote?.en ||
    !raw.attribution?.fa ||
    !raw.attribution?.en ||
    (raw.status !== "published" && raw.status !== "draft")
  ) {
    throw new Error(
      `Testimonial ${filePath} is missing required fields (id, quoteType, quote, attribution, status). ` +
        `Run \`npm run validate:content\` for details.`
    );
  }
  return raw;
}

/** All testimonials on disk (published + draft), sorted by id. */
export function loadTestimonials(): TestimonialContent[] {
  return Object.entries(modules)
    .map(([filePath, raw]) => requireTestimonial(filePath, raw))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function isPublishedTestimonial(item: Pick<TestimonialContent, "status">): boolean {
  return item.status === "published";
}

export function localizeTestimonial(item: TestimonialContent, lang: Lang): LocalizedTestimonial {
  return {
    id: item.id,
    quoteType: item.quoteType,
    quote: item.quote[lang] ?? item.quote.en,
    attribution: item.attribution[lang] ?? item.attribution.en,
    relatedProjectSlug: item.relatedProjectSlug,
  };
}

/** Published testimonials for the current locale (empty → section stays hidden). */
export function getLocalizedTestimonials(lang: Lang): LocalizedTestimonial[] {
  return loadTestimonials()
    .filter(isPublishedTestimonial)
    .map((item) => localizeTestimonial(item, lang));
}
