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

describe("App smoke", () => {
  it("renders Persian (default) without console errors", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<App />);
    expect(document.getElementById("main")).toBeTruthy();
    expect(err).not.toHaveBeenCalled();
  });

  it("renders English at /en without console errors", () => {
    window.history.pushState(null, "", "/en");
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
    window.history.pushState(null, "", "/en");
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

  it("applies shortened locale SEO title and description without keywords meta", () => {
    render(<App />);
    expect(document.title).toBe(dictionaries.fa.seo.title);
    expect(document.title.length).toBeLessThanOrEqual(60);
    expect(dictionaries.fa.seo.description.length).toBeLessThanOrEqual(155);
    expect(dictionaries.en.seo.title.length).toBeLessThanOrEqual(60);
    expect(dictionaries.en.seo.description.length).toBeLessThanOrEqual(155);
    expect(document.querySelector('meta[name="keywords"]')).toBeNull();
    const desc = document.querySelector('meta[name="description"]');
    expect(desc?.getAttribute("content")).toBe(dictionaries.fa.seo.description);
  });

  it("switches SEO title and description on English route", () => {
    window.history.pushState(null, "", "/en");
    render(<App />);
    expect(document.title).toBe(dictionaries.en.seo.title);
    const desc = document.querySelector('meta[name="description"]');
    expect(desc?.getAttribute("content")).toBe(dictionaries.en.seo.description);
  });

  it("renders projects page teaser CTA on home", () => {
    render(<App />);
    expect(screen.getByText(dictionaries.fa.projects.seeAll)).toBeTruthy();
  });
});
