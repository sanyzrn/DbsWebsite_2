import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { dictionaries } from "../lib/i18n";
import { getLocalizedProjects } from "../lib/projects";

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("project case-study detail rendering", () => {
  it("renders problem/approach/result on the Persian detail route", () => {
    const pulse = getLocalizedProjects("fa").find((p) => p.slug === "dbspulse");
    expect(pulse?.problem).toBeTruthy();
    window.history.pushState(null, "", "/projects/dbspulse");
    render(<App />);
    expect(screen.getByText(dictionaries.fa.projects.problemLabel)).toBeTruthy();
    expect(screen.getByText(dictionaries.fa.projects.approachLabel)).toBeTruthy();
    expect(screen.getByText(dictionaries.fa.projects.resultLabel)).toBeTruthy();
    expect(screen.getByText(pulse!.problem)).toBeTruthy();
    expect(screen.getByText(pulse!.approach)).toBeTruthy();
    expect(screen.getByText(pulse!.result)).toBeTruthy();
  });

  it("renders problem/approach/result on the English detail route", () => {
    const pulse = getLocalizedProjects("en").find((p) => p.slug === "dbspulse");
    window.history.pushState(null, "", "/en/projects/dbspulse");
    render(<App />);
    expect(screen.getByText(dictionaries.en.projects.problemLabel)).toBeTruthy();
    expect(screen.getByText(pulse!.problem)).toBeTruthy();
    expect(screen.getByText(pulse!.result)).toBeTruthy();
  });
});
