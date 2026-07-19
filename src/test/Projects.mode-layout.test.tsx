import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import Projects from "../components/Projects";
import { AppProvider } from "../lib/app";

function renderProjects(mode: "teaser" | "full") {
  return render(
    <MemoryRouter initialEntries={["/"]}>
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

describe("Projects mobile layout by mode", () => {
  it('mode="teaser" renders the SnapCarousel container', () => {
    renderProjects("teaser");
    expect(screen.getByTestId("projects-carousel")).toBeTruthy();
    expect(screen.getByTestId("projects-carousel").querySelector('[aria-roledescription="carousel"]')).toBeTruthy();
    expect(screen.getByTestId("projects-grid")).toBeTruthy();
    expect(screen.getByTestId("projects-grid").className).toMatch(/hidden/);
  });

  it('mode="full" renders the plain stacked grid and no carousel', () => {
    renderProjects("full");
    expect(screen.queryByTestId("projects-carousel")).toBeNull();
    expect(document.querySelector('[aria-roledescription="carousel"]')).toBeNull();
    const grid = screen.getByTestId("projects-grid");
    expect(grid).toBeTruthy();
    expect(grid.className).not.toMatch(/\bhidden\b/);
  });

  it('mode="teaser" ProjectCards clamp title/description and keep a footer with mt-auto', () => {
    renderProjects("teaser");
    const carousel = screen.getByTestId("projects-carousel");
    const cards = carousel.querySelectorAll("article");
    expect(cards.length).toBeGreaterThan(1);

    cards.forEach((card) => {
      expect(card.className).toMatch(/min-h-\[440px\]/);
      expect(card.className).toMatch(/\bh-full\b/);
      const title = card.querySelector("h3");
      const desc = Array.from(card.querySelectorAll("p")).find((p) => p.className.includes("text-ink2"));
      expect(title?.className).toMatch(/line-clamp-2/);
      expect(desc?.className).toMatch(/line-clamp-3/);
      const footer = card.querySelector('[data-testid="project-card-footer"]');
      expect(footer).toBeTruthy();
      expect(footer?.querySelector("a")).toBeTruthy();
      expect(footer?.className).toMatch(/mt-auto/);
    });

    // Full-page grid markup (separate from ProjectCard) must stay unclamped.
    cleanup();
    const { container: full } = renderProjects("full");
    const grid = within(full).getByTestId("projects-grid");
    const gridTitles = grid.querySelectorAll("h3");
    expect(gridTitles.length).toBeGreaterThan(0);
    gridTitles.forEach((h) => {
      expect(h.className).not.toMatch(/line-clamp/);
    });
  });
});
