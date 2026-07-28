import { getLocalizedProjects, type LocalizedProject } from "../projects";
import fa, { type UiDict, type Lang, PROJECT_TYPE_IDS, DEFAULT_PROJECT_TYPE, type ProjectTypeId } from "./fa";
import en from "./en";

export type { Lang, UiDict, ProjectTypeId };
export { PROJECT_TYPE_IDS, DEFAULT_PROJECT_TYPE, fa, en };

export const dictionaries: Record<Lang, UiDict> = { fa, en };

/** Full UI dictionary including projects loaded from content/projects/*.json */
export type Dict = UiDict & {
  projects: UiDict["projects"] & { items: LocalizedProject[] };
};

export function getDictionary(lang: Lang): Dict {
  const base = dictionaries[lang];
  return {
    ...base,
    projects: {
      ...base.projects,
      items: getLocalizedProjects(lang),
    },
  };
}
