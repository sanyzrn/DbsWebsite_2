/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.mdx" {
  import type { ComponentType, ReactNode } from "react";

  export type MDXComponents = {
    [key: string]: ComponentType<Record<string, unknown>> | keyof HTMLElementTagNameMap | undefined;
    Callout?: ComponentType<{ children?: ReactNode; variant?: string; title?: string }>;
  };

  export const frontmatter: {
    title: string;
    description: string;
    date: string;
    updated?: string;
    tags: string[];
    readingTimeMinutes?: number;
    status: "published" | "draft";
  };

  const MDXComponent: ComponentType<{ components?: MDXComponents }>;
  export default MDXComponent;
}
