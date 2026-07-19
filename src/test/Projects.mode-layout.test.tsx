import { cleanup, render, screen } from "@testing-library/react";
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
});
