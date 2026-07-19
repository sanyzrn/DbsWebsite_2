import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { dictionaries } from "../lib/i18n";

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubEnv("VITE_FORMSPREE_ID", "");
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.body.style.overflow = "";
  document.getElementById("root")?.removeAttribute("inert");
  document.getElementById("root")?.remove();
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("Contact inquiry modal focus management", () => {
  it("moves focus into the dialog, traps Tab, and restores focus on Escape", async () => {
    const user = userEvent.setup();
    window.history.pushState(null, "", "/about");

    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
    render(<App />, { container: root });

    const openBtn = await screen.findByRole("button", { name: dictionaries.fa.contact.secondary });
    openBtn.focus();
    expect(openBtn).toHaveFocus();

    await user.click(openBtn);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(dictionaries.fa.contact.form.formUnavailable)).toBeTruthy();
    const emailLink = within(dialog).getByRole("link", { name: dictionaries.fa.contact.email });
    await waitFor(() => {
      expect(emailLink).toHaveFocus();
    });

    expect(root.hasAttribute("inert")).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");

    // Tab through every focusable until we wrap back to the first (email link).
    let wrapped = false;
    for (let i = 0; i < 40; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
      if (document.activeElement === emailLink) {
        wrapped = true;
        break;
      }
    }
    expect(wrapped).toBe(true);

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await waitFor(() => {
      expect(openBtn).toHaveFocus();
    });
    expect(root.hasAttribute("inert")).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });
});
