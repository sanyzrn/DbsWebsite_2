import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "../lib/app";
import FloatingQuickNav from "../components/FloatingQuickNav";
import { dictionaries } from "../lib/i18n";

const fqnCss = readFileSync(resolve(__dirname, "../index.css"), "utf8");

function renderNav(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppProvider>
        <FloatingQuickNav />
      </AppProvider>
    </MemoryRouter>
  );
}

function setScrollY(y: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
  Object.defineProperty(window, "pageYOffset", { configurable: true, value: y });
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  window.dispatchEvent(new Event("resize"));
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  setScrollY(0);
  setViewportWidth(1024);
  document.documentElement.classList.remove("dark");
});

beforeEach(() => {
  setScrollY(0);
  setViewportWidth(1024);
  vi.stubGlobal(
    "requestAnimationFrame",
    (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    }
  );
});

describe("FloatingQuickNav", () => {
  it("renders three primary links to locale home/projects/about", () => {
    renderNav("/");
    const home = screen.getByRole("link", { name: dictionaries.fa.nav.home });
    const projects = screen.getByRole("link", { name: dictionaries.fa.nav.projects });
    const about = screen.getByRole("link", { name: dictionaries.fa.nav.about });
    expect(home).toHaveAttribute("href", "/");
    expect(projects).toHaveAttribute("href", "/projects");
    expect(about).toHaveAttribute("href", "/about");
  });

  it("uses /en prefixes on English routes", () => {
    renderNav("/en");
    expect(screen.getByRole("link", { name: dictionaries.en.nav.home })).toHaveAttribute("href", "/en");
    expect(screen.getByRole("link", { name: dictionaries.en.nav.projects })).toHaveAttribute("href", "/en/projects");
    expect(screen.getByRole("link", { name: dictionaries.en.nav.about })).toHaveAttribute("href", "/en/about");
  });

  it("keeps scroll-to-top absent below the threshold", () => {
    renderNav("/");
    expect(screen.queryByRole("button", { name: dictionaries.fa.footer.backTop })).toBeNull();
  });

  it("shows a focusable scroll-to-top button above the threshold", async () => {
    renderNav("/");
    setScrollY(500);
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });
    const btn = await screen.findByRole("button", { name: dictionaries.fa.footer.backTop });
    expect(btn).toBeTruthy();
    expect(btn.tabIndex).not.toBe(-1);
  });

  it("does not use goo filter markup", async () => {
    const { container } = renderNav("/");
    setScrollY(500);
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(container.querySelector("[data-gooing]")).toBeNull();
    expect(container.querySelector(".fqn-goo-active")).toBeNull();
    expect(container.querySelector(".fqn-goo-layer")).toBeNull();
    expect(container.querySelector("filter")).toBeNull();
  });

  it("keeps nav pill and scroll-to-top as separate fixed containers (no shared flex shell)", async () => {
    const { container } = renderNav("/");
    setScrollY(500);
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });

    const host = container.querySelector(".floating-quick-nav");
    const nav = container.querySelector(".fqn-nav");
    const btn = await screen.findByRole("button", { name: dictionaries.fa.footer.backTop });

    // No shared .fqn-shell flex row — both are direct children of the var host.
    expect(container.querySelector(".fqn-shell")).toBeNull();
    expect(host).toBeTruthy();
    expect(nav?.parentElement).toBe(host);
    expect(btn.parentElement).toBe(host);
    expect(nav?.contains(btn)).toBe(false);
    expect(btn.contains(nav!)).toBe(false);

    // CSS positions each as its own fixed element (jsdom cannot reliably compute layout).
    expect(fqnCss).toMatch(/\.fqn-nav\s*\{[^}]*position:\s*fixed/s);
    expect(fqnCss).toMatch(/\.fqn-scroll-btn\s*\{[^}]*position:\s*fixed/s);
    expect(fqnCss).not.toMatch(/\.fqn-shell\s*\{/);
    expect(fqnCss).not.toMatch(/left:\s*50%/);
    expect(fqnCss).not.toMatch(/translateX\(\s*-50%\s*\)/);
  });

  it("keeps all floating-nav labels visible on mobile (not active-only)", () => {
    // Labels must remain visible at every breakpoint — do not hide inactive ones.
    expect(fqnCss).not.toMatch(
      /@media\s*\(max-width:\s*767px\)\s*\{[^}]*\.fqn-label\s*\{[^}]*display:\s*none/s
    );
    expect(fqnCss).toMatch(/\.fqn-label\s*\{[^}]*white-space:\s*nowrap/s);
    // Active styling remains for visual weight.
    expect(fqnCss).toMatch(/\.fqn-item-active\s*\{/);
  });

  it.each([
    { width: 375, label: "mobile" },
    { width: 1024, label: "desktop" },
  ] as const)(
    "places nav bottom-right and scroll-to-top bottom-left on $label viewport",
    async ({ width }) => {
      setViewportWidth(width);
      const { container } = renderNav("/");
      setScrollY(500);
      await act(async () => {
        window.dispatchEvent(new Event("scroll"));
      });

      const nav = container.querySelector(".fqn-nav")!;
      const btn = await screen.findByRole("button", { name: dictionaries.fa.footer.backTop });

      // Same corner assignment on both breakpoints (no mobile-centered behavior).
      expect(nav).toHaveAttribute("data-fqn-corner", "bottom-right");
      expect(btn).toHaveAttribute("data-fqn-corner", "bottom-left");
      expect(nav.classList.contains("fqn-nav")).toBe(true);
      expect(btn.classList.contains("fqn-scroll-btn")).toBe(true);

      // Expected CSS: nav physical right + bottom; scroll physical left + same bottom vars.
      expect(fqnCss).toMatch(/\.fqn-nav\s*\{[^}]*right:\s*var\(--fqn-mobile-side/s);
      expect(fqnCss).toMatch(/\.fqn-nav\s*\{[^}]*bottom:\s*var\(--fqn-mobile-bottom\)/s);
      expect(fqnCss).toMatch(/\.fqn-scroll-btn\s*\{[^}]*left:\s*var\(--fqn-mobile-side/s);
      expect(fqnCss).toMatch(/\.fqn-scroll-btn\s*\{[^}]*bottom:\s*var\(--fqn-mobile-bottom\)/s);
      expect(fqnCss).toMatch(
        /@media\s*\(min-width:\s*768px\)\s*\{\s*\.fqn-nav\s*\{[^}]*right:\s*var\(--fqn-desktop-inset\)/s
      );
      expect(fqnCss).toMatch(
        /@media\s*\(min-width:\s*768px\)\s*\{\s*\.fqn-scroll-btn\s*\{[^}]*left:\s*var\(--fqn-desktop-inset\)/s
      );
      // Matching vertical inset on desktop for both elements.
      expect(fqnCss).toMatch(
        /@media\s*\(min-width:\s*768px\)\s*\{\s*\.fqn-nav\s*\{[^}]*bottom:\s*var\(--fqn-desktop-inset\)/s
      );
      expect(fqnCss).toMatch(
        /@media\s*\(min-width:\s*768px\)\s*\{\s*\.fqn-scroll-btn\s*\{[^}]*bottom:\s*var\(--fqn-desktop-inset\)/s
      );

      // z-index stays below mobile nav overlay (z-40) / header (z-50).
      expect(fqnCss).toMatch(/\.fqn-nav\s*\{[^}]*z-index:\s*30/s);
      expect(fqnCss).toMatch(/\.fqn-scroll-btn\s*\{[^}]*z-index:\s*30/s);

      void width; // viewport exercised via re-render; corners identical on both widths
    }
  );
});
