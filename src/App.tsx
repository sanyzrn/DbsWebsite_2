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
      <main id="main" className={cn(clearFixedNav && "pt-[88px] lg:pt-0")}>
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
        {routesFromManifest()}
        {/* Client catch-all — prerender emits /404 + /en/404 separately via specialPaths */}
        <Route path="*" element={<NotFoundPage />} />
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
      <AppShell />
    </BrowserRouter>
  );
}
