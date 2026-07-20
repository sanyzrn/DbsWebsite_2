import type { Lang } from "./i18n";

/** Bilingual string used in content/projects/*.json */
export type LocaleText = { fa: string; en: string };
export type LocaleList = { fa: string[]; en: string[] };

export type ProjectStatus = "production" | "concept";
/** Publication readiness — independent of `status` (what kind of thing it is). */
export type ProjectMaturity = "draft" | "review" | "published" | "archived";
/** Explicit Schema.org type for project JSON-LD — set deliberately per project. */
export type ProjectSchemaType = "SoftwareApplication" | "CreativeWork" | "Article";

/**
 * Canonical project content schema (authoritative name: `order`, not `display_order`).
 * Written as content/projects/*.json; loaded at build time via import.meta.glob.
 * Runtime shape is enforced by `scripts/project-content.mjs` (Zod) at build time.
 */
/** Public repo/demo link in content JSON (bilingual label). */
export type ProjectLink = { label: LocaleText; href: string };

export type ProjectContent = {
  id: string;
  slug: string;
  status: ProjectStatus;
  maturity: ProjectMaturity;
  /** Explicit Schema.org type — never inferred from tags. */
  schemaType: ProjectSchemaType;
  /**
   * When true, project JSON-LD may include a free Offer.
   * Keep false unless the project is a free public application.
   */
  isPubliclyAvailable: boolean;
  featured: boolean;
  order: number;
  name: LocaleText;
  subtitle: LocaleText;
  desc: LocaleText;
  problem: LocaleText;
  approach: LocaleText;
  result: LocaleText;
  role: LocaleList;
  tech: string[];
  tags: string[];
  image_url: string | null;
  /** Optional UI mock key for portfolio screenshots — presentation-only. */
  mock?: string;
  /** Optional capability list (e.g. DbsAI). */
  caps?: LocaleList;
  /** Calendar year of the engagement, e.g. "2025". Omit when unknown. */
  year?: string;
  /** Engagement length in months. Omit when unknown. */
  durationMonths?: number;
  /** e.g. "Solo" or "Team of 3". Omit when unknown/unshareable. */
  teamSize?: string;
  /** Anonymized client context. Omit when unknown/unshareable. */
  clientType?: LocaleText;
  /** Public repo/demo links only — never invent. */
  links?: ProjectLink[];
  /** ISO date (YYYY-MM-DD) — sitemap lastmod when present. */
  updatedAt?: string;
  /** Editorial flag: generic case-study copy pending Saeed’s confirmation. */
  _todo?: string;
};

/** Locale-resolved project used by UI components. */
export type LocalizedProject = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  desc: string;
  problem: string;
  approach: string;
  result: string;
  role: string[];
  tech: string[];
  tags: string[];
  status: ProjectStatus;
  maturity: ProjectMaturity;
  schemaType: ProjectSchemaType;
  isPubliclyAvailable: boolean;
  featured: boolean;
  order: number;
  image_url: string | null;
  mock?: string;
  caps?: string[];
  year?: string;
  durationMonths?: number;
  teamSize?: string;
  clientType?: string;
  links?: { label: string; href: string }[];
};

const modules = import.meta.glob("../../content/projects/*.json", {
  eager: true,
  import: "default",
}) as Record<string, ProjectContent>;

export function loadProjectContent(): ProjectContent[] {
  return Object.values(modules).sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export function isPublishedProject(project: Pick<ProjectContent, "maturity">): boolean {
  return project.maturity === "published";
}

export function localizeProject(project: ProjectContent, lang: Lang): LocalizedProject {
  const pick = (value: LocaleText) => value[lang] ?? value.en ?? "";
  const pickList = (value: LocaleList) => value[lang] ?? value.en ?? [];

  return {
    id: project.id,
    slug: project.slug,
    name: pick(project.name),
    subtitle: pick(project.subtitle),
    desc: pick(project.desc),
    problem: pick(project.problem),
    approach: pick(project.approach),
    result: pick(project.result),
    role: pickList(project.role),
    tech: project.tech,
    tags: project.tags,
    status: project.status,
    maturity: project.maturity,
    schemaType: project.schemaType,
    isPubliclyAvailable: project.isPubliclyAvailable,
    featured: project.featured,
    order: project.order,
    image_url: project.image_url,
    mock: project.mock,
    caps: project.caps ? pickList(project.caps) : undefined,
    year: project.year,
    durationMonths: project.durationMonths,
    teamSize: project.teamSize,
    clientType: project.clientType ? pick(project.clientType) : undefined,
    links: project.links?.map((link) => ({ label: pick(link.label), href: link.href })),
  };
}

/** Public listings (home teaser, /projects grid). Drafts stay off these lists. */
export function getLocalizedProjects(lang: Lang): LocalizedProject[] {
  return loadProjectContent()
    .filter(isPublishedProject)
    .map((p) => localizeProject(p, lang));
}

/** Direct URL / prerender lookup — includes unpublished projects for internal review. */
export function findLocalizedProject(lang: Lang, slug: string): LocalizedProject | undefined {
  const raw = loadProjectContent().find((p) => p.slug === slug || p.id === slug);
  return raw ? localizeProject(raw, lang) : undefined;
}
