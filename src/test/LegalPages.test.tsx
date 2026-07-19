import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "../lib/app";
import { dictionaries } from "../lib/i18n";
import PrivacyPage from "../pages/PrivacyPage";
import TermsPage from "../pages/TermsPage";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.lang = "fa";
  document.documentElement.dir = "rtl";
  window.history.replaceState(null, "", "/");
});

describe("Privacy and Terms pages", () => {
  it("renders privacy sections with headings in Persian", () => {
    render(
      <MemoryRouter initialEntries={["/privacy"]}>
        <AppProvider>
          <Routes>
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>
    );

    const copy = dictionaries.fa.privacy;
    expect(screen.getByRole("heading", { level: 1, name: copy.title })).toBeVisible();
    expect(screen.getByText(copy.updated)).toBeVisible();
    expect(copy.sections).toHaveLength(6);
    for (const section of copy.sections) {
      expect(screen.getByRole("heading", { level: 2, name: section.heading })).toBeVisible();
      expect(screen.getByText(section.body)).toBeVisible();
    }
  });

  it("renders terms sections with headings in English", () => {
    render(
      <MemoryRouter initialEntries={["/en/terms"]}>
        <AppProvider>
          <Routes>
            <Route path="/en/terms" element={<TermsPage />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>
    );

    const copy = dictionaries.en.terms;
    expect(screen.getByRole("heading", { level: 1, name: copy.title })).toBeVisible();
    expect(copy.sections).toHaveLength(6);
    const first = copy.sections[0];
    const heading = screen.getByRole("heading", { level: 2, name: first.heading });
    expect(heading).toBeVisible();
    expect(within(heading.parentElement as HTMLElement).getByText(first.body)).toBeVisible();
  });

  it("keeps matching section counts across locales and drops paragraphs", () => {
    expect(dictionaries.fa.privacy.sections).toHaveLength(dictionaries.en.privacy.sections.length);
    expect(dictionaries.fa.terms.sections).toHaveLength(dictionaries.en.terms.sections.length);
    expect(dictionaries.fa.privacy).not.toHaveProperty("paragraphs");
    expect(dictionaries.en.terms).not.toHaveProperty("paragraphs");
  });
});
