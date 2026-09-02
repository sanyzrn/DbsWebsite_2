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
  it("renders the articles list for both locales with published notes", () => {
    window.history.pushState(null, "", "/en/articles");
    render(<App />);
    expect(screen.getByRole("heading", { level: 2, name: dictionaries.en.articles.pageTitle })).toBeTruthy();
    expect(screen.queryByText(dictionaries.en.articles.empty)).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: /From idea to AI layer/i })).toBeTruthy();

    cleanup();
    window.history.pushState(null, "", "/articles");
    render(<App />);
    expect(screen.getByRole("heading", { level: 2, name: dictionaries.fa.articles.pageTitle })).toBeTruthy();
    expect(screen.queryByText(dictionaries.fa.articles.empty)).toBeNull();
  });

  it("renders a published article detail with breadcrumbs", async () => {
    window.history.pushState(null, "", "/en/articles/ai-layer-without-boiling-the-ocean");
    render(<App />);
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /From idea to AI layer/i,
      })
    ).toBeTruthy();
    const crumbs = screen.getByRole("navigation", { name: dictionaries.en.nav.breadcrumbLabel });
    expect(crumbs.querySelector(`a[href="/en/articles"]`)).toBeTruthy();
    expect(crumbs.querySelector(`a[href="/en"]`)).toBeTruthy();
  });

  it("exposes Field Notes as primary in nav/footer; hides the paused Daily Digest", () => {
    render(<App />);
    const articleLinks = screen.getAllByRole("link", { name: dictionaries.fa.nav.articles });
    expect(articleLinks.length).toBeGreaterThanOrEqual(2);
    expect(articleLinks.every((a) => a.getAttribute("href") === "/articles")).toBe(true);

    // The temporary feature switch keeps Daily Digest out of public navigation.
    const newsLinks = screen.queryAllByRole("link", { name: dictionaries.fa.nav.news });
    expect(newsLinks.length).toBe(0);
  });

  it("does not surface the paused Daily Digest from the Field Notes landing", () => {
    window.history.pushState(null, "", "/en/articles");
    render(<App />);
    expect(screen.queryByRole("heading", { level: 2, name: dictionaries.en.articles.digestTitle })).toBeNull();
    expect(screen.queryByRole("link", { name: dictionaries.en.articles.digestCta })).toBeNull();
  });

  it("redirects the paused English Daily Digest to Field Notes", async () => {
    window.history.pushState(null, "", "/en/news");
    render(<App />);
    expect(await screen.findByRole("heading", { level: 2, name: dictionaries.en.articles.pageTitle })).toBeTruthy();
  });

  it("redirects the paused Persian Daily Digest to Field Notes", async () => {
    window.history.pushState(null, "", "/news");
    render(<App />);
    expect(await screen.findByRole("heading", { level: 2, name: dictionaries.fa.articles.pageTitle })).toBeTruthy();
  });
});
