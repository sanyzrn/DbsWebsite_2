/**
 * Shared testimonials schema + build gates.
 * Keep in sync with `src/lib/testimonials.ts` TypeScript types.
 *
 * Files live at content/testimonials/<id>.json — one entry per file.
 * Do not invent quotes or names. Leave the folder empty until a real entry exists.
 *
 * quoteType:
 *   - "direct" — attributed spoken/written quote; quote text required in both locales
 *   - "outcome-statement" — factual result without a named quote voice; equal visual weight
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { ROOT } from "./site-url.mjs";
import { loadProjectsFromDisk } from "./project-content.mjs";

const localeText = z.object({
  fa: z.string().min(1),
  en: z.string().min(1),
});

/** Non-empty bilingual quote — required for both quoteTypes. */
const quoteLocaleText = z.object({
  fa: z.string().trim().min(1),
  en: z.string().trim().min(1),
});

export const testimonialContentSchema = z.object({
  id: z.string().min(1),
  quoteType: z.enum(["direct", "outcome-statement"]),
  quote: quoteLocaleText,
  attribution: localeText,
  relatedProjectSlug: z.string().min(1).optional(),
  status: z.enum(["published", "draft"]),
});

const TESTIMONIAL_FILE_RE = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.json$/;

export function testimonialsDir(root = ROOT) {
  return path.join(root, "content", "testimonials");
}

export function loadTestimonialsFromDisk(root = ROOT) {
  const dir = testimonialsDir(root);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const file = path.join(dir, f);
      const raw = JSON.parse(fs.readFileSync(file, "utf8"));
      return { file, name: f, raw };
    });
}

/**
 * Validate every on-disk testimonial JSON. Empty folder is OK (section stays hidden).
 * Throws with a multi-line error on failure.
 * @returns {object[]} parsed testimonials
 */
export function validateAllTestimonialContent(root = ROOT) {
  const entries = loadTestimonialsFromDisk(root);
  const errors = [];
  const items = [];
  const seenIds = new Set();

  const projectSlugs = new Set(
    loadProjectsFromDisk(root).map(({ raw }) => raw?.slug).filter(Boolean)
  );

  for (const { file, name, raw } of entries) {
    const match = TESTIMONIAL_FILE_RE.exec(name);
    if (!match) {
      errors.push(
        `${name} has an invalid filename — expected <id>.json (lowercase kebab-case id)`
      );
      continue;
    }
    const fileId = match[1];

    const parsed = testimonialContentSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      errors.push(`${name} failed schema validation:\n${detail}`);
      continue;
    }

    const item = parsed.data;

    if (item.id !== fileId) {
      errors.push(`${name} id "${item.id}" must match filename id "${fileId}"`);
    }

    if (seenIds.has(item.id)) {
      errors.push(`${name} duplicates id "${item.id}"`);
    }
    seenIds.add(item.id);

    // direct quotes must carry real bilingual quote text (Zod already enforces non-empty;
    // keep an explicit message aligned with the honesty principle).
    if (item.quoteType === "direct") {
      if (!item.quote.fa.trim() || !item.quote.en.trim()) {
        errors.push(
          `${name} quoteType "direct" requires non-empty quote text in both fa and en. ` +
            `Do not invent quotes — leave the entry as draft or omit it until a real quote exists.`
        );
      }
    }

    if (item.relatedProjectSlug && projectSlugs.size > 0 && !projectSlugs.has(item.relatedProjectSlug)) {
      errors.push(
        `${name} relatedProjectSlug "${item.relatedProjectSlug}" does not match any project slug`
      );
    }

    items.push({
      ...item,
      __file: file,
      __name: name,
    });
  }

  if (errors.length) {
    throw new Error(
      `Testimonial content validation failed (${errors.length} file(s)):\n\n` + errors.join("\n\n")
    );
  }

  return items.sort((a, b) => a.id.localeCompare(b.id));
}
