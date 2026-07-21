import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import ArticleDetailPage from "../pages/ArticleDetailPage";
import { AppProvider } from "../lib/app";
import { dictionaries } from "../lib/i18n";
import { loadProjectContent } from "../lib/projects";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.lang = "fa";
  document.documentElement.dir = "rtl";
});

function renderAt(path: string, element: ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <Routes>
          <Route path="/en/projects/:slug" element={element} />
          <Route path="/projects/:slug" element={element} />
          <Route path="/en/articles/:slug" element={element} />
          <Route path="/articles/:slug" element={element} />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  );
}

describe("visible breadcrumbs on detail pages", () => {
  it("renders Home > Projects > name on a project detail page", () => {
    const slug = loadProjectContent().find((p) => p.maturity === "published")?.slug ?? "dbspulse";
    renderAt(`/en/projects/${slug}`, <ProjectDetailPage />);
    const nav = screen.getByRole("navigation", { name: dictionaries.en.nav.breadcrumbLabel });
    expect(nav.textContent).toContain(dictionaries.en.nav.home);
    expect(nav.textContent).toContain(dictionaries.en.nav.projects);
    expect(nav.querySelector('[aria-current="page"]')).toBeTruthy();
  });

  it("renders Home > Field Notes > title on an article detail page", () => {
    renderAt("/en/articles/ai-layer-without-boiling-the-ocean", <ArticleDetailPage />);
    const nav = screen.getByRole("navigation", { name: dictionaries.en.nav.breadcrumbLabel });
    expect(nav.textContent).toContain(dictionaries.en.nav.home);
    expect(nav.textContent).toContain(dictionaries.en.nav.articles);
    expect(nav.querySelector('[aria-current="page"]')).toBeTruthy();
  });
});
