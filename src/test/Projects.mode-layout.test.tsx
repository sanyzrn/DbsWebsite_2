import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import Projects from "../components/Projects";
import { AppProvider } from "../lib/app";
import { dictionaries } from "../lib/i18n";
import { getLocalizedProjects } from "../lib/projects";

function renderProjects(mode: "teaser" | "full", path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <Projects mode={mode} />
      </AppProvider>
    </MemoryRouter>
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("Projects layout by mode", () => {
  it('mode="teaser" renders proofs inside a section heading (h2) and no page grid', () => {
    renderProjects("teaser");
    const teaser = screen.getByTestId("projects-teaser");
    expect(screen.queryByTestId("projects-grid")).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: dictionaries.fa.projects.title })).toBeTruthy();
    const proofs = teaser.querySelectorAll("article");
    expect(proofs.length).toBeGreaterThan(0);
    proofs.forEach((proof) => {
      // Each proof names its project in an h3 and links to the case study.
      expect(proof.querySelector("h3 a")).toBeTruthy();
      expect(within(proof as HTMLElement).getByText(dictionaries.fa.projects.readCase)).toBeTruthy();
    });
  });

  it('mode="full" is the page: h1 title, every project, filters that match content', () => {
    renderProjects("full", "/en/projects");
    expect(screen.queryByTestId("projects-teaser")).toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: dictionaries.en.projects.pageTitle })).toBeTruthy();
    const grid = screen.getByTestId("projects-grid");
    const all = getLocalizedProjects("en");
    expect(grid.querySelectorAll("article")).toHaveLength(all.length);

    // Every offered filter selects at least one project.
    const filterButtons = screen.getAllByRole("button", { pressed: false });
    for (const btn of filterButtons) {
      const tag = btn.textContent ?? "";
      expect(all.some((p) => p.tags.includes(tag))).toBe(true);
    }
    expect(screen.getByRole("button", { pressed: true })).toHaveTextContent(dictionaries.en.projects.filterAll);
  });

  it("filtering narrows the list and marks the active filter", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    renderProjects("full", "/en/projects");
    const all = getLocalizedProjects("en");
    const [first] = screen.getAllByRole("button", { pressed: false });
    const tag = first.textContent ?? "";
    await user.click(first);
    expect(first).toHaveAttribute("aria-pressed", "true");
    const expected = all.filter((p) => p.tags.includes(tag)).length;
    expect(screen.getByTestId("projects-grid").querySelectorAll("article")).toHaveLength(expected);
  });
});
