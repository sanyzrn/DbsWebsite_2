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

describe("project visual accessible names + studio alt", () => {
  it("names project preview links from the localized aria template", () => {
    const pulse = getLocalizedProjects("en").find((p) => p.slug === "dbspulse");
    expect(pulse).toBeTruthy();
    window.history.pushState(null, "", "/en/projects");
    render(<App />);

    const label = dictionaries.en.projects.previewAria.replace("{name}", pulse!.name);
    const preview = screen.getAllByRole("link", { name: label });
    expect(preview.length).toBeGreaterThan(0);
    expect(preview[0]).toHaveAttribute("href", "/en/projects/dbspulse");
  });

  it("uses a specific studio image alt on the About page", () => {
    window.history.pushState(null, "", "/en/about");
    render(<App />);
    const img = screen.getByRole("img", { name: dictionaries.en.about.studioAlt });
    expect(img).toHaveAttribute("src", "/images/studio.jpg");
    expect(img).not.toHaveAttribute("alt", dictionaries.en.about.title);
  });
});
