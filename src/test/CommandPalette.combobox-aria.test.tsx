import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { dictionaries } from "../lib/i18n";

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("CommandPalette combobox ARIA", () => {
  it("wires combobox to listbox options via aria-controls and aria-activedescendant", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard("{Control>}k{/Control}");

    const input = await screen.findByRole("combobox");
    const listbox = screen.getByRole("listbox");
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(listbox.id).toBe("command-palette-listbox");

    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThan(0);
    expect(options[0]).toHaveAttribute("id");
    expect(input).toHaveAttribute("aria-activedescendant", options[0]!.id);

    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(input).toHaveAttribute("aria-activedescendant", options[1]!.id);
    });
    expect(options[1]).toHaveAttribute("aria-selected", "true");

    // Stable id shape for a known command
    const projects = options.find((o) => o.textContent?.includes(dictionaries.fa.nav.projects));
    expect(projects?.id).toMatch(/^cmd-option-/);
  });
});
