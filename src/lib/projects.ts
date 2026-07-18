import type { Lang } from "./i18n";

/** Bilingual string used in content/projects/*.json */
export type LocaleText = { fa: string; en: string };
export type LocaleList = { fa: string[]; en: string[] };

/**
 * Canonical project content schema (authoritative name: `order`, not `display_order`).
 * Written by the PHP admin publish flow; loaded at build time via import.meta.glob.
 */
export type ProjectContent = {
  id: string;
  slug: string;
  status: "production" | "concept";
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
  status: "production" | "concept";
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
    featured: project.featured,
    order: project.order,
    image_url: project.image_url,
    mock: project.mock,
    caps: project.caps ? pickList(project.caps) : undefined,
  };
}

export function getLocalizedProjects(lang: Lang): LocalizedProject[] {
  return loadProjectContent().map((p) => localizeProject(p, lang));
}

export function findLocalizedProject(lang: Lang, slug: string): LocalizedProject | undefined {
  return getLocalizedProjects(lang).find((p) => p.slug === slug || p.id === slug);
}
