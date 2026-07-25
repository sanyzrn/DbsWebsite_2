import { Suspense } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./lib/app";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import CommandPalette from "./components/CommandPalette";
import ScrollToTop from "./components/ScrollToTop";
import FloatingQuickNav from "./components/FloatingQuickNav";
import PwaInstallPrompt from "./components/PwaInstallPrompt";
import { LocalePreferenceRedirect } from "./components/LocalePreferenceRedirect";
import { PageTransition } from "./components/PageTransition";
import NotFoundPage from "./pages/NotFoundPage";
import { routesFromManifest } from "./lib/routesFromManifest";
import { cn } from "./utils/cn";

function isHomePath(pathname: string) {
  return pathname === "/" || pathname === "/en" || pathname === "/en/";
}

/**
 * Minimal on-brand spinner shown while the top-level Suspense is active
 * (project/article chunk loading during first paint, before hydrateRoot kicks in).
 * Respects prefers-reduced-motion — the spinner simply fades in without spinning
 * when the user has opted out of animations.
 */
function AppLoadingFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-page"
      role="status"
      aria-label="Loading…"
    >
      <span
        className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent motion-safe:animate-spin"
        aria-hidden="true"
      />
    </div>
  );
}

/** Lightweight per-page loading indicator shown inside the layout shell. */
function PageLoadingFallback() {
  return (
    <div
      className="flex min-h-[30vh] items-center justify-center"
      role="status"
      aria-label="Loading…"
    >
      <span
        className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent motion-safe:animate-spin"
        aria-hidden="true"
      />
    </div>
  );
}

function Layout() {
  const { t } = useApp();
  const { pathname } = useLocation();
  // Hero already clears the fixed 72px nav; other routes need mobile top padding.
  const clearFixedNav = !isHomePath(pathname);

  return (
    <div className="min-h-screen bg-page font-sans text-ink">
      <a href="#main" className="skip-link">
        {t.a11y.skip}
      </a>
      <Nav />
      <FloatingQuickNav />
      <PwaInstallPrompt />
      <main id="main" className={cn(clearFixedNav && "pt-[88px]")}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <CommandPalette />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/*
         * Inner Suspense: catches lazy page-chunk loading and per-page article
         * data suspension (articles.ts getCache() throws articlesLoadPromise).
         * Projects data is already available (resolved by the outer Suspense).
         */}
        <Route
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Outlet />
            </Suspense>
          }
        >
          {routesFromManifest()}
          {/* Client catch-all — prerender emits /404 + /en/404 separately via specialPaths */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

/** Shared shell for BrowserRouter (client) and StaticRouter (prerender). */
export function AppShell() {
  return (
    <AppProvider>
      <ScrollToTop />
      <LocalePreferenceRedirect />
      <AppRoutes />
    </AppProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/*
       * Outer Suspense: catches AppProvider suspension when project data isn't
       * loaded yet (projects.ts getCache() throws projectsLoadPromise, called
       * synchronously by getDictionary inside AppProvider's useMemo).
       *
       * With hydrateRoot (prerendered pages), React keeps the server HTML visible
       * while this resolves — no visible flash of fallback content.
       */}
      <Suspense fallback={<AppLoadingFallback />}>
        <AppShell />
      </Suspense>
    </BrowserRouter>
  );
}
