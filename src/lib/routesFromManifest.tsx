import React, { lazy, type ComponentType } from "react";
import { Route } from "react-router-dom";
import type { ReactElement } from "react";
import siteRoutes from "../../shared/site-routes.json";

/**
 * SSR/test-compatible lazy wrapper.
 *
 * Starts loading the module immediately at import time (creating separate
 * JS chunks in the client build while reducing the initial bundle). When the
 * module has already resolved — i.e. during SSR prerender after ensureLoaded(),
 * or in tests after setup.ts awaits preloadAllPages() — the lazy component
 * resolves synchronously via a custom thenable so React.lazy does not suspend
 * inside renderToString.
 */
function syncCompatibleLazy<T extends ComponentType<object>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  let resolvedModule: { default: T } | undefined;

  // Fire the import immediately: chunks start downloading in the browser,
  // and in SSR/test environments the module is ready before renderToString.
  const load = factory().then((mod) => {
    resolvedModule = mod;
    return mod;
  });

  return lazy((): Promise<{ default: T }> => {
    if (resolvedModule !== undefined) {
      // Module already loaded → return a synchronous thenable so React.lazy
      // sets _status=1 (fulfilled) in the same tick, avoiding a Suspense suspend.
      return {
        then(
          onFulfilled: (v: { default: T }) => void,
          _onRejected?: (e: unknown) => void
        ) {
          onFulfilled(resolvedModule!);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return this as any;
        },
      } as unknown as Promise<{ default: T }>;
    }
    return load;
  });
}

const HomePage = syncCompatibleLazy(() => import("../pages/HomePage"));
const ProjectsPage = syncCompatibleLazy(() => import("../pages/ProjectsPage"));
const ProjectDetailPage = syncCompatibleLazy(() => import("../pages/ProjectDetailPage"));
const ArticlesPage = syncCompatibleLazy(() => import("../pages/ArticlesPage"));
const ArticleDetailPage = syncCompatibleLazy(() => import("../pages/ArticleDetailPage"));
const NewsPage = syncCompatibleLazy(() => import("../pages/NewsPage"));
const AboutPage = syncCompatibleLazy(() => import("../pages/AboutPage"));
const ContactPage = syncCompatibleLazy(() => import("../pages/ContactPage"));
const PrivacyPage = syncCompatibleLazy(() => import("../pages/PrivacyPage"));
const TermsPage = syncCompatibleLazy(() => import("../pages/TermsPage"));

/** Page key → component. Keys match shared/site-routes.json pageKeys + dynamicPaths.page */
const PAGES = {
  home: HomePage,
  projects: ProjectsPage,
  projectDetail: ProjectDetailPage,
  articles: ArticlesPage,
  articleDetail: ArticleDetailPage,
  news: NewsPage,
  about: AboutPage,
  contact: ContactPage,
  privacy: PrivacyPage,
  terms: TermsPage,
} as const;

type PageKey = keyof typeof PAGES;

function enPath(bare: string): string {
  return bare === "/" ? "/en" : `/en${bare}`;
}

/**
 * Pre-load all page chunks so that syncCompatibleLazy resolves synchronously
 * in SSR (prerender) and test environments. Must be awaited before renderToString.
 */
export async function preloadAllPages(): Promise<void> {
  await Promise.all([
    import("../pages/HomePage"),
    import("../pages/ProjectsPage"),
    import("../pages/ProjectDetailPage"),
    import("../pages/ArticlesPage"),
    import("../pages/ArticleDetailPage"),
    import("../pages/NewsPage"),
    import("../pages/AboutPage"),
    import("../pages/ContactPage"),
    import("../pages/PrivacyPage"),
    import("../pages/TermsPage"),
  ]);
}

/**
 * Emit fa + /en Route pairs from the shared manifest so App.tsx stays in sync
 * with sitemap/prerender (shared/site-routes.json).
 */
export function routesFromManifest(): ReactElement[] {
  const out: ReactElement[] = [];

  for (const bare of siteRoutes.staticPaths) {
    const key = (siteRoutes.pageKeys as Record<string, string>)[bare] as PageKey | undefined;
    if (!key || !(key in PAGES)) {
      throw new Error(`site-routes.json pageKeys missing component mapping for "${bare}"`);
    }
    const Page = PAGES[key];
    out.push(<Route key={bare} path={bare} element={<Page />} />);
    out.push(<Route key={enPath(bare)} path={enPath(bare)} element={<Page />} />);
  }

  for (const dyn of siteRoutes.dynamicPaths) {
    const key = dyn.page as PageKey;
    if (!(key in PAGES)) {
      throw new Error(`site-routes.json dynamicPaths page "${dyn.page}" has no component`);
    }
    const Page = PAGES[key];
    out.push(<Route key={dyn.path} path={dyn.path} element={<Page />} />);
    out.push(<Route key={enPath(dyn.path)} path={enPath(dyn.path)} element={<Page />} />);
  }

  return out;
}
