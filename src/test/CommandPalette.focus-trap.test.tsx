import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { dictionaries } from "../lib/i18n";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.body.style.overflow = "";
  document.getElementById("root")?.removeAttribute("inert");
  document.getElementById("root")?.remove();
  window.history.replaceState(null, "", "/");
});

describe("CommandPalette focus containment", () => {
  it("traps Tab inside the dialog, marks #root inert, locks scroll, and restores focus on close", async () => {
    const user = userEvent.setup();

    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
    render(<App />, { container: root });

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.textContent = "opener";
    root.appendChild(trigger);
    trigger.focus();
    expect(trigger).toHaveFocus();

    await user.keyboard("{Control>}k{/Control}");

    const dialog = await screen.findByRole("dialog");
    const input = screen.getByRole("combobox");
    await waitFor(() => {
      expect(input).toHaveFocus();
    });

    expect(root.hasAttribute("inert")).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");

    let wrapped = false;
    for (let i = 0; i < 60; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
      if (document.activeElement === input) {
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
      expect(trigger).toHaveFocus();
    });
    expect(root.hasAttribute("inert")).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps the combobox ARIA wiring", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.keyboard("{Control>}k{/Control}");
    const input = await screen.findByRole("combobox");
    const listbox = screen.getByRole("listbox");
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(dictionaries.fa.command.title).toBeTruthy();
  });
});
