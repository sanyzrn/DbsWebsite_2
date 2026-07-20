import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { dictionaries } from "../lib/i18n";

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("articles routes", () => {
  it("renders the articles list for both locales", () => {
    window.history.pushState(null, "", "/en/articles");
    render(<App />);
    expect(screen.getByRole("heading", { level: 2, name: dictionaries.en.articles.pageTitle })).toBeTruthy();
    expect(screen.getByText(dictionaries.en.articles.empty)).toBeTruthy();

    cleanup();
    window.history.pushState(null, "", "/articles");
    render(<App />);
    expect(screen.getByRole("heading", { level: 2, name: dictionaries.fa.articles.pageTitle })).toBeTruthy();
  });

  it("renders a draft article detail with back link (reviewable URL)", async () => {
    window.history.pushState(null, "", "/en/articles/ai-layer-without-boiling-the-ocean");
    render(<App />);
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /From idea to AI layer/i,
      })
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: dictionaries.en.articles.back })).toHaveAttribute(
      "href",
      "/en/articles"
    );
  });

  it("exposes Field Notes in primary nav and footer", () => {
    render(<App />);
    const links = screen.getAllByRole("link", { name: dictionaries.fa.nav.articles });
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(links.some((a) => a.getAttribute("href") === "/articles")).toBe(true);
  });
});
