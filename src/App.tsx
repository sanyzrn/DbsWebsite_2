import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./lib/app";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import CommandPalette from "./components/CommandPalette";
import ScrollToTop from "./components/ScrollToTop";
import FloatingQuickNav from "./components/FloatingQuickNav";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import AboutPage from "./pages/AboutPage";

function Layout() {
  const { t } = useApp();
  return (
    <div id="top" className="min-h-screen bg-page font-sans text-ink">
      <a href="#main" className="skip-link">
        {t.a11y.skip}
      </a>
      <Nav />
      <FloatingQuickNav />
      <main id="main">
        <Outlet />
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

        <Route path="/en" element={<HomePage />} />
        <Route path="/en/projects" element={<ProjectsPage />} />
        <Route path="/en/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/en/about" element={<AboutPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ScrollToTop />
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
