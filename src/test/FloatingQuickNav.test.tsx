import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "../lib/app";
import FloatingQuickNav from "../components/FloatingQuickNav";
import { dictionaries } from "../lib/i18n";

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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  setScrollY(0);
  document.documentElement.classList.remove("dark");
});

beforeEach(() => {
  setScrollY(0);
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

  it("keeps scroll-to-top absent / aria-hidden below the threshold", () => {
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
    expect(btn).not.toHaveAttribute("aria-hidden", "true");
    expect(btn.tabIndex).toBe(0);
  });

  it("skips the goo transition class entirely under reduced motion", async () => {
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

    const { container } = renderNav("/");
    const root = container.querySelector(".floating-quick-nav");
    expect(root).toHaveAttribute("data-reduce-motion", "true");

    setScrollY(500);
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });

    expect(root).toHaveAttribute("data-gooing", "false");
    expect(container.querySelector(".fqn-goo-active")).toBeNull();
    expect(container.querySelector(".fqn-scroll-btn-reduced")).toBeTruthy();
  });
});
