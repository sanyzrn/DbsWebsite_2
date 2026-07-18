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
});

describe("App smoke", () => {
  it("renders Persian (default) without console errors", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<App />);
    expect(document.getElementById("main")).toBeTruthy();
    expect(err).not.toHaveBeenCalled();
  });

  it("renders English when sz-lang=en", () => {
    localStorage.setItem("sz-lang", "en");
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<App />);
    expect(document.getElementById("main")).toBeTruthy();
    expect(screen.getAllByText(/Saeed/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/From an idea/i).length).toBeGreaterThan(0);
    expect(err).not.toHaveBeenCalled();
  });

  it("shows hero sloganCycle[0] on initial render (fa)", () => {
    render(<App />);
    const phrase = dictionaries.fa.hero.sloganCycle[0];
    expect(screen.getAllByText(phrase).length).toBeGreaterThan(0);
  });

  it("shows hero sloganCycle[0] on initial render (en)", () => {
    localStorage.setItem("sz-lang", "en");
    render(<App />);
    const phrase = dictionaries.en.hero.sloganCycle[0];
    expect(screen.getAllByText(phrase).length).toBeGreaterThan(0);
  });

  it("shows hero sloganCycle[0] under prefers-reduced-motion", () => {
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
    render(<App />);
    const phrase = dictionaries.fa.hero.sloganCycle[0];
    expect(screen.getAllByText(phrase).length).toBeGreaterThan(0);
  });
});
