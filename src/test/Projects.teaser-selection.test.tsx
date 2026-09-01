import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import Projects from "../components/Projects";
import { AppProvider } from "../lib/app";
import { getLocalizedProjects } from "../lib/projects";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function renderTeaser() {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <AppProvider>
        <Projects mode="teaser" />
      </AppProvider>
    </MemoryRouter>
  );
  return screen.getByTestId("projects-carousel");
}

/**
 * The teaser used to pick projects from a hardcoded slug list. Setting those projects
 * to `maturity: "draft"` left every id unmatched and the home page shipped an empty
 * "featured projects" section. These tests pin the selection to content instead.
 */
describe("home teaser project selection", () => {
  it("renders a card for every published project, up to the teaser limit", () => {
    const published = getLocalizedProjects("fa");
    expect(published.length).toBeGreaterThan(0);

    const carousel = renderTeaser();
    const cards = carousel.querySelectorAll("article");

    expect(cards.length).toBe(Math.min(published.length, 4));
  });

  it("is never empty while any project is published", () => {
    expect(getLocalizedProjects("fa").length).toBeGreaterThan(0);
    expect(renderTeaser().querySelectorAll("article").length).toBeGreaterThan(0);
  });

  it("puts shipped, featured work first", () => {
    const carousel = renderTeaser();
    const names = Array.from(carousel.querySelectorAll("article h3")).map((h) =>
      (h.textContent ?? "").trim()
    );
    expect(names.length).toBeGreaterThan(0);

    const published = getLocalizedProjects("fa");
    const expectedFirst = published.find((p) => p.featured && p.status !== "concept") ?? published[0];
    expect(names[0]).toBe(expectedFirst.name);

    // Concept explorations never outrank shipped production work in the teaser.
    const shownProjects = names.map((name) => published.find((p) => p.name === name));
    const firstConcept = shownProjects.findIndex((p) => p?.status === "concept");
    const lastProduction = shownProjects.map((p) => p?.status).lastIndexOf("production");
    if (firstConcept !== -1 && lastProduction !== -1) {
      expect(firstConcept).toBeGreaterThan(lastProduction);
    }
  });
});
