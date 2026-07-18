import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";

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
});
