import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CareerTimeline } from "../components/About";
import { AppProvider } from "../lib/app";
import { dictionaries } from "../lib/i18n";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderTimeline(langPath: "/" | "/en" = "/") {
  const dict = langPath === "/en" ? dictionaries.en : dictionaries.fa;
  return {
    dict,
    ...render(
      <MemoryRouter initialEntries={[langPath]}>
        <AppProvider>
          <CareerTimeline nodes={dict.about.path} />
        </AppProvider>
      </MemoryRouter>
    ),
  };
}

describe("CareerTimeline", () => {
  it("renders every path node with visible year, title, and body (fa)", () => {
    const { dict, container } = renderTimeline("/");
    const list = container.querySelector(".career-timeline");
    expect(list).toBeTruthy();

    const items = within(list as HTMLElement).getAllByRole("listitem");
    expect(items).toHaveLength(dict.about.path.length);

    for (const node of dict.about.path) {
      expect(screen.getByText(node.year)).toBeVisible();
      expect(screen.getByText(node.title)).toBeVisible();
      expect(screen.getByText(node.body)).toBeVisible();
    }

    const egg = dict.about.path.find((n) => n.kind === "easter-egg");
    expect(egg).toBeTruthy();
    expect(container.querySelector('[data-kind="easter-egg"]')).toBeTruthy();
    expect(screen.getByText(egg!.body)).toBeVisible();
  });

  it("renders every path node with visible year, title, and body (en)", () => {
    const { dict, container } = renderTimeline("/en");
    expect(dict.about.path.some((n) => n.kind === "easter-egg")).toBe(true);

    for (const node of dict.about.path) {
      expect(screen.getByText(node.year)).toBeVisible();
      expect(screen.getByText(node.title)).toBeVisible();
      expect(screen.getByText(node.body)).toBeVisible();
    }

    expect(container.querySelectorAll(".career-node")).toHaveLength(dict.about.path.length);
    expect(container.querySelector(".career-node-egg")).toBeTruthy();
  });
});
