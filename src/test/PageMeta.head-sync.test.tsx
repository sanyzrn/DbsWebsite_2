import { cleanup, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { PageMeta } from "../components/PageMeta";
import { AppProvider } from "../lib/app";
import { dictionaries } from "../lib/i18n";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.head
    .querySelectorAll('link[rel="canonical"], link[rel="alternate"], script[type="application/ld+json"]')
    .forEach((el) => el.remove());
});

function renderMeta(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <AppProvider>{ui}</AppProvider>
    </MemoryRouter>
  );
}

describe("PageMeta", () => {
  it("renders no DOM of its own", () => {
    // The prerender writes the authoritative head. Rendering the same tags here would
    // leave the server with an empty slot and the client with a tree — a hydration
    // mismatch that makes React discard the entire prerendered DOM.
    const { container } = renderMeta(<PageMeta page="projects" />);
    expect(container.innerHTML).toBe("");
  });

  it("syncs title, description and canonical into the head after mount", async () => {
    renderMeta(<PageMeta page="projects" />);

    await waitFor(() => {
      expect(document.title).toBe(dictionaries.fa.seo.projects.title);
    });
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      dictionaries.fa.seo.projects.description
    );
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });

  it("emits one parseable script per JSON-LD block", async () => {
    renderMeta(<PageMeta page="home" />);

    await waitFor(() => {
      expect(document.head.querySelectorAll('script[type="application/ld+json"]').length).toBeGreaterThan(0);
    });

    for (const script of document.head.querySelectorAll('script[type="application/ld+json"]')) {
      expect(() => JSON.parse(script.textContent ?? "")).not.toThrow();
    }
  });

  it("does not accumulate duplicate head tags when the route changes", async () => {
    const { rerender } = renderMeta(<PageMeta page="projects" />);

    await waitFor(() => {
      expect(document.title).toBe(dictionaries.fa.seo.projects.title);
    });

    rerender(
      <MemoryRouter>
        <AppProvider>
          <PageMeta page="about" />
        </AppProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.title).toBe(dictionaries.fa.seo.about.title);
    });
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
  });

  it("drops canonical and hreflang on noindex routes", async () => {
    renderMeta(<PageMeta page="notFound" />);

    await waitFor(() => {
      expect(document.head.querySelector('meta[name="robots"]')?.getAttribute("content")).toContain(
        "noindex"
      );
    });
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(0);
    expect(document.head.querySelectorAll('link[rel="alternate"]')).toHaveLength(0);
  });
});
