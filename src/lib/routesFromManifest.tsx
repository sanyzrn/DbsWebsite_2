import React, { lazy, type ComponentType } from "react";
import { Navigate, Route } from "react-router-dom";
import type { ReactElement } from "react";
import siteRoutes from "../../shared/site-routes.json";
import { DAILY_DIGEST_ENABLED } from "./news";

/**
 * SSR/test-compatible lazy wrapper.
 *
 * Defers page loading until navigation (creating separate
 * JS chunks in the client build while reducing the initial bundle). When the
 * module has already resolved — i.e. during SSR prerender after ensureLoaded(),
 * or in tests after setup.ts awaits preloadAllPages() — the lazy component
 * resolves synchronously via a custom thenable so React.lazy does not suspend
 * inside renderToString.
 */
const pagePreloaders: (() => Promise<unknown>)[] = [];

function syncCompatibleLazy<T extends ComponentType<object>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  let resolvedModule: { default: T } | undefined;

  // SSR/tests call preloadAllPages; ordinary visits download only their route.
  let load: Promise<{ default: T }> | undefined;
  const start = () => load ??= factory().then((mod) => { resolvedModule = mod; return mod; });
  pagePreloaders.push(start);

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
    return start();
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
const NexaChatPage = syncCompatibleLazy(() => import("../pages/NexaChatPage"));
const IssuesPage = syncCompatibleLazy(() => import("../pages/IssuesPage"));
const PrivacyPage = syncCompatibleLazy(() => import("../pages/PrivacyPage"));
const TermsPage = syncCompatibleLazy(() => import("../pages/TermsPage"));
const NexPage = syncCompatibleLazy(() => import("../pages/NexLandingPage"));
const NexFeaturesPage = syncCompatibleLazy(() => import("../pages/nex/NexFeaturesPage"));
const NexGuidePage = syncCompatibleLazy(() => import("../pages/nex/NexGuidePage"));
const NexChangelogPage = syncCompatibleLazy(() => import("../pages/nex/NexChangelogPage"));
const NexDownloadPage = syncCompatibleLazy(() => import("../pages/nex/NexDownloadPage"));
const NexThemesPage = syncCompatibleLazy(() => import("../pages/nex/NexThemesPage"));
const NexFaqPage = syncCompatibleLazy(() => import("../pages/nex/NexFaqPage"));
const NexPrivacyPage = syncCompatibleLazy(() => import("../pages/nex/NexPrivacyPage"));

const LaunchPage = syncCompatibleLazy(() => import("../pages/ComingSoonPage"));

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
  issues: IssuesPage,
  nexachat: NexaChatPage,
  privacy: PrivacyPage,
  terms: TermsPage,
  launch: LaunchPage,
  nex: NexPage,
  nexFeatures: NexFeaturesPage,
  nexGuide: NexGuidePage,
  nexChangelog: NexChangelogPage,
  nexDownload: NexDownloadPage,
  nexThemes: NexThemesPage,
  nexFaq: NexFaqPage,
  nexPrivacy: NexPrivacyPage,
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
  await Promise.all(pagePreloaders.map((load) => load()));
}

/**
 * Emit fa + /en Route pairs from the shared manifest so App.tsx stays in sync
 * with sitemap/prerender (shared/site-routes.json).
 */
export function routesFromManifest(): ReactElement[] {
  const out: ReactElement[] = [];

  // The article was renamed to NexaHR; preserve inbound links to the former slug.
  out.push(
    <Route
      key="legacy-dbspulse-article-fa"
      path="/articles/dbspulse-from-spreadsheet-to-system"
      element={<Navigate replace to="/articles/nexahr-from-spreadsheet-to-system" />}
    />,
    <Route
      key="legacy-dbspulse-article-en"
      path="/en/articles/dbspulse-from-spreadsheet-to-system"
      element={<Navigate replace to="/en/articles/nexahr-from-spreadsheet-to-system" />}
    />
  );

  for (const bare of siteRoutes.staticPaths) {
    if (bare === "/news" && !DAILY_DIGEST_ENABLED) {
      // Preserve old links while keeping the paused digest out of public navigation.
      out.push(<Route key={bare} path={bare} element={<Navigate replace to="/articles" />} />);
      out.push(<Route key={enPath(bare)} path={enPath(bare)} element={<Navigate replace to="/en/articles" />} />);
      continue;
    }
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
