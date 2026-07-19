import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { dictionaries } from "../lib/i18n";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.body.style.overflow = "";
  window.history.replaceState(null, "", "/");
});

describe("Mobile nav focus management", () => {
  it("keeps closed links inert, focuses first link on open, restores toggle on close", async () => {
    const user = userEvent.setup();
    render(<App />);

    const toggle = screen.getByRole("button", { name: dictionaries.fa.nav.menu });
    expect(toggle).toHaveAttribute("aria-controls", "mobile-nav-panel");
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    const panel = document.getElementById("mobile-nav-panel");
    expect(panel).toBeTruthy();
    const panelWrap = panel!.parentElement as HTMLElement;
    expect(panelWrap.hasAttribute("inert")).toBe(true);

    const firstLink = panel!.querySelector("a") as HTMLAnchorElement;
    expect(firstLink).toBeTruthy();
    // Closed links sit under an inert ancestor — not keyboard-operable in real browsers.
    // (jsdom does not fully emulate inert tab-order skipping.)
    expect(firstLink.closest("[inert]")).toBe(panelWrap);

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(panelWrap.hasAttribute("inert")).toBe(false);
    expect(document.body.style.overflow).toBe("hidden");

    await waitFor(() => {
      expect(firstLink).toHaveFocus();
    });

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(toggle).toHaveFocus();
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panelWrap.hasAttribute("inert")).toBe(true);
    expect(firstLink.closest("[inert]")).toBe(panelWrap);
    expect(document.body.style.overflow).toBe("");
  });
});
