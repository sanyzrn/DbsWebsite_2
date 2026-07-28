import { Callout } from "./Callout";

/** Components available inside article MDX bodies — keep this whitelist minimal. */
export const articleMdxComponents = {
  Callout,
} as const;

export type ArticleMdxComponents = typeof articleMdxComponents;
