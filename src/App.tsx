import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./lib/app";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import CommandPalette from "./components/CommandPalette";
import ScrollToTop from "./components/ScrollToTop";
import FloatingQuickNav from "./components/FloatingQuickNav";
import PwaInstallPrompt from "./components/PwaInstallPrompt";
import { LocalePreferenceRedirect } from "./components/LocalePreferenceRedirect";
import { PageTransition } from "./components/PageTransition";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFoundPage from "./pages/NotFoundPage";

function Layout() {
  const { t } = useApp();
  return (
    <div className="min-h-screen bg-page font-sans text-ink">
      <a href="#main" className="skip-link">
        {t.a11y.skip}
      </a>
      <Nav />
      <FloatingQuickNav />
      <PwaInstallPrompt />
      <main id="main">
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
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        <Route path="/en" element={<HomePage />} />
        <Route path="/en/projects" element={<ProjectsPage />} />
        <Route path="/en/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/en/about" element={<AboutPage />} />
        <Route path="/en/privacy" element={<PrivacyPage />} />
        <Route path="/en/terms" element={<TermsPage />} />

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
