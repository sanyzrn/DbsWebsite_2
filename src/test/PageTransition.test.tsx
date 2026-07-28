import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { dictionaries } from "../lib/i18n";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.documentElement.lang = "fa";
  document.documentElement.dir = "rtl";
  window.history.replaceState(null, "", "/");
});

describe("PageTransition", () => {
  it("wraps the current route content with an enter transition", () => {
    render(<App />);

    const shell = document.querySelector("[data-page-transition]");
    expect(shell).toBeTruthy();
    expect(shell).toHaveAttribute("data-page-transition", "on");
    expect(shell).toHaveAttribute("data-pathname", "/");
    expect(shell).toHaveClass("page-enter");
    // Routed home content is inside the transition wrapper.
    expect(shell?.textContent).toContain(dictionaries.fa.hero.sloganCycle[0]);
  });

  it("disables transition classes under prefers-reduced-motion", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });

    window.history.replaceState(null, "", "/en");
    render(<App />);

    const shell = document.querySelector("[data-page-transition]");
    expect(shell).toBeTruthy();
    expect(shell).toHaveAttribute("data-page-transition", "off");
    expect(shell).not.toHaveClass("page-enter");
    expect(shell).toHaveAttribute("data-pathname", "/en");
    expect(screen.getAllByText(dictionaries.en.hero.sloganCycle[0]).length).toBeGreaterThan(0);
  });
});
