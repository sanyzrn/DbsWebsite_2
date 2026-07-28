/**
 * Shared project content schema + maturity gates for build scripts.
 * Keep in sync with `src/lib/projects.ts` TypeScript types.
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { ROOT } from "./site-url.mjs";

const localeText = z.object({
  fa: z.string(),
  en: z.string(),
});

const localeList = z.object({
  fa: z.array(z.string()),
  en: z.array(z.string()),
});

export const MATURITIES = ["draft", "review", "published", "archived"];
export const STATUSES = ["production", "concept"];

/** Markers that must not appear in published case-study copy. */
export const PLACEHOLDER_MARKERS = [
  "_todo",
  "TBD",
  "details soon",
  "جزئیات به‌زودی",
  "placeholder case-study",
  "will be filled in later",
];

const projectLink = z.object({
  label: localeText,
  href: z.string().url(),
});

export const projectContentSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(["production", "concept"]),
  maturity: z.enum(["draft", "review", "published", "archived"]),
  /** Explicit Schema.org type — set deliberately, never inferred from tags. */
  schemaType: z.enum(["SoftwareApplication", "CreativeWork", "Article"]),
  /**
   * When true, JSON-LD may include a free Offer. Default false — only flip
   * when the project is factually a free, publicly usable application.
   */
  isPubliclyAvailable: z.boolean(),
  featured: z.boolean(),
  order: z.number().finite(),
  name: localeText,
  subtitle: localeText,
  desc: localeText,
  problem: localeText,
  approach: localeText,
  result: localeText,
  role: localeList,
  tech: z.array(z.string()),
  tags: z.array(z.string()),
  image_url: z.string().nullable(),
  mock: z.string().optional(),
  caps: localeList.optional(),
  /** Calendar year of the engagement, e.g. "2025". Omit when unknown. */
  year: z.string().min(1).optional(),
  /** Engagement length in months. Omit when unknown. */
  durationMonths: z.number().positive().finite().optional(),
  /** e.g. "Solo" or "Team of 3". Omit when unknown/unshareable. */
  teamSize: z.string().min(1).optional(),
  /** Anonymized client context. Omit when unknown/unshareable. */
  clientType: localeText.optional(),
  /** Public repo/demo links only — never invent. */
  links: z.array(projectLink).optional(),
  /** ISO date (YYYY-MM-DD) — drives sitemap lastmod when present. */
  updatedAt: z.string().min(1).optional(),
  _todo: z.string().optional(),
});

export function projectsDir(root = ROOT) {
  return path.join(root, "content", "projects");
}

export function loadProjectsFromDisk(root = ROOT) {
  const dir = projectsDir(root);
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

function collectFieldText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(collectFieldText).join("\n");
  if (typeof value === "object") return Object.values(value).map(collectFieldText).join("\n");
  return String(value);
}

/** Scan problem/approach/result/desc (fa+en) for placeholder markers. */
export function findPlaceholderHits(project) {
  const blob = ["desc", "problem", "approach", "result"]
    .map((key) => collectFieldText(project[key]))
    .join("\n");
  const lower = blob.toLowerCase();
  const hits = [];
  for (const marker of PLACEHOLDER_MARKERS) {
    if (lower.includes(marker.toLowerCase())) hits.push(marker);
  }
  if (typeof project._todo === "string" && project._todo.trim()) {
    hits.push("_todo field");
  }
  return hits;
}

/**
 * Validate every on-disk project JSON. Throws with a multi-line error on failure.
 * @returns {object[]} parsed published+draft projects (full list)
 */
export function validateAllProjectContent(root = ROOT) {
  const entries = loadProjectsFromDisk(root);
  if (!entries.length) {
    throw new Error(`No project JSON files found in ${projectsDir(root)}`);
  }

  const errors = [];
  const projects = [];

  for (const { file, name, raw } of entries) {
    const parsed = projectContentSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      errors.push(`${name} failed schema validation:\n${detail}`);
      continue;
    }

    const project = parsed.data;
    if (project.maturity === "published") {
      const hits = findPlaceholderHits(project);
      if (hits.length) {
        errors.push(
          `${name} has maturity "published" but still contains placeholder marker(s): ${hits.join(", ")}. ` +
            `Set maturity to "draft" (or remove the markers) before publishing.`
        );
      }
    }
    projects.push({ ...project, __file: file, __name: name });
  }

  if (errors.length) {
    throw new Error(
      `Project content validation failed (${errors.length} file(s)):\n\n` + errors.join("\n\n")
    );
  }

  return projects;
}

export function getPublishedProjectSlugs(root = ROOT) {
  return validateAllProjectContent(root)
    .filter((p) => p.maturity === "published")
    .map((p) => p.slug)
    .sort();
}
