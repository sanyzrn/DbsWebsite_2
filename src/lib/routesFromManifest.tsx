import { Route } from "react-router-dom";
import type { ReactElement } from "react";
import siteRoutes from "../../shared/site-routes.json";
import HomePage from "../pages/HomePage";
import ProjectsPage from "../pages/ProjectsPage";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import ArticlesPage from "../pages/ArticlesPage";
import ArticleDetailPage from "../pages/ArticleDetailPage";
import NewsPage from "../pages/NewsPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import PrivacyPage from "../pages/PrivacyPage";
import TermsPage from "../pages/TermsPage";

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
