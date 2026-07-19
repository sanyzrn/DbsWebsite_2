import type { Lang } from "./i18n";

/** Bilingual string used in content/projects/*.json */
export type LocaleText = { fa: string; en: string };
export type LocaleList = { fa: string[]; en: string[] };

export type ProjectStatus = "production" | "concept";
/** Publication readiness — independent of `status` (what kind of thing it is). */
export type ProjectMaturity = "draft" | "review" | "published" | "archived";

/**
 * Canonical project content schema (authoritative name: `order`, not `display_order`).
 * Written by the PHP admin publish flow; loaded at build time via import.meta.glob.
 * Runtime shape is enforced by `scripts/project-content.mjs` (Zod) at build time.
 */
export type ProjectContent = {
  id: string;
  slug: string;
  status: ProjectStatus;
  maturity: ProjectMaturity;
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
  featured: boolean;
  order: number;
  image_url: string | null;
  mock?: string;
  caps?: string[];
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
    featured: project.featured,
    order: project.order,
    image_url: project.image_url,
    mock: project.mock,
    caps: project.caps ? pickList(project.caps) : undefined,
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
