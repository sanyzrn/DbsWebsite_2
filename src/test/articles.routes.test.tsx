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

  it("exposes Field Notes as primary and Daily Digest as secondary in nav/footer", () => {
    render(<App />);
    const articleLinks = screen.getAllByRole("link", { name: dictionaries.fa.nav.articles });
    expect(articleLinks.length).toBeGreaterThanOrEqual(2);
    expect(articleLinks.every((a) => a.getAttribute("href") === "/articles")).toBe(true);

    const newsLinks = screen.getAllByRole("link", { name: dictionaries.fa.nav.news });
    expect(newsLinks.length).toBeGreaterThanOrEqual(2);
    expect(newsLinks.every((a) => a.getAttribute("href") === "/news")).toBe(true);
  });

  it("surfaces Daily Digest from the Field Notes landing", () => {
    window.history.pushState(null, "", "/en/articles");
    render(<App />);
    expect(screen.getByRole("heading", { level: 2, name: dictionaries.en.articles.digestTitle })).toBeTruthy();
    expect(screen.getByRole("link", { name: dictionaries.en.articles.digestCta })).toHaveAttribute(
      "href",
      "/en/news"
    );
  });

  it("renders the Daily Digest empty state with a back link to Field Notes", async () => {
    window.history.pushState(null, "", "/en/news");
    render(<App />);
    expect(await screen.findByRole("heading", { level: 2, name: dictionaries.en.news.title })).toBeTruthy();
    expect(screen.getByText(dictionaries.en.news.empty)).toBeTruthy();
    expect(screen.getByRole("link", { name: dictionaries.en.news.back })).toHaveAttribute("href", "/en/articles");
  });

  it("renders the Persian Daily Digest empty state", async () => {
    window.history.pushState(null, "", "/news");
    render(<App />);
    expect(await screen.findByRole("heading", { level: 2, name: dictionaries.fa.news.title })).toBeTruthy();
    expect(screen.getByText(dictionaries.fa.news.empty)).toBeTruthy();
  });
});
