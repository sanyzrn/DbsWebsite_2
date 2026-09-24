import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "../lib/app";
import FloatingQuickNav from "../components/FloatingQuickNav";
import { dictionaries } from "../lib/i18n";

const css = readFileSync(resolve(__dirname, "../index.css"), "utf8");
const fa = dictionaries.fa;

function renderNav(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppProvider>
        <FloatingQuickNav />
        <main data-testid="outside">page</main>
      </AppProvider>
    </MemoryRouter>
  );
}

function setScrollY(y: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
}

beforeEach(() => {
  setScrollY(0);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  setScrollY(0);
});

describe("FloatingQuickNav", () => {
  it("starts closed: only the toggle is operable, the strip is inert", () => {
    const { container } = renderNav("/");
    const toggle = screen.getByRole("button", { name: fa.nav.quickOpen });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    const panel = document.getElementById(toggle.getAttribute("aria-controls")!);
    expect(panel).toHaveAttribute("inert");
    expect(container.querySelector(".fqn-nav")).not.toHaveClass("is-open");
  });

  it("opens on tap, exposes locale links, and closes again from the same button", async () => {
    const user = userEvent.setup();
    const { container } = renderNav("/");
    await user.click(screen.getByRole("button", { name: fa.nav.quickOpen }));

    const close = screen.getByRole("button", { name: fa.nav.quickClose });
    expect(close).toHaveAttribute("aria-expanded", "true");
    expect(container.querySelector(".fqn-nav")).toHaveClass("is-open");
    expect(document.getElementById(close.getAttribute("aria-controls")!)).not.toHaveAttribute("inert");
    expect(screen.getByRole("link", { name: fa.nav.home })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: fa.nav.projects })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: fa.nav.home })).toHaveAttribute("aria-current", "page");

    await user.click(close);
    expect(screen.getByRole("button", { name: fa.nav.quickOpen })).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape and on an outside tap", async () => {
    const user = userEvent.setup();
    renderNav("/");
    await user.click(screen.getByRole("button", { name: fa.nav.quickOpen }));
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: fa.nav.quickOpen })).toHaveAttribute("aria-expanded", "false");

    await user.click(screen.getByRole("button", { name: fa.nav.quickOpen }));
    await user.click(screen.getByTestId("outside"));
    expect(screen.getByRole("button", { name: fa.nav.quickOpen })).toHaveAttribute("aria-expanded", "false");
  });

  it("shows scroll-to-top as its own fixed element once scrolled", async () => {
    const { container } = renderNav("/");
    expect(screen.queryByRole("button", { name: fa.footer.backTop })).toBeNull();
    setScrollY(500);
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });
    const btn = await screen.findByRole("button", { name: fa.footer.backTop });
    const nav = container.querySelector(".fqn-nav")!;
    expect(nav.contains(btn)).toBe(false);
    expect(nav).toHaveAttribute("data-fqn-corner", "bottom-right");
    expect(btn).toHaveAttribute("data-fqn-corner", "bottom-left");
  });

  it("keeps its CSS contract: fixed corners, below the header, hidden from lg up", () => {
    expect(css).toMatch(/\.fqn-nav\s*\{[^}]*position:\s*fixed/s);
    expect(css).toMatch(/\.fqn-nav\s*\{[^}]*z-index:\s*30/s);
    expect(css).toMatch(/\.fqn-nav\s*\{[^}]*right:\s*var\(--fqn-mobile-side/s);
    expect(css).toMatch(/\.fqn-scroll-btn\s*\{[^}]*position:\s*fixed/s);
    expect(css).toMatch(/\.fqn-scroll-btn\s*\{[^}]*left:\s*var\(--fqn-mobile-side/s);
    expect(css).toMatch(/@media\s*\(min-width:\s*1024px\)\s*\{\s*\.floating-quick-nav\s*\{\s*display:\s*none/s);
    // Labels never collapse to icon-only.
    expect(css).toMatch(/\.fqn-label\s*\{[^}]*white-space:\s*nowrap/s);
  });
});
