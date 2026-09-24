import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AccentSwatches } from "../components/AccentPicker";
import { AppProvider } from "../lib/app";
import { dictionaries } from "../lib/i18n";

function renderPicker() {
  return render(
    <MemoryRouter initialEntries={["/en"]}>
      <AppProvider>
        <AccentSwatches />
      </AppProvider>
    </MemoryRouter>
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.removeAttribute("data-accent");
});

describe("Accent picker", () => {
  it("defaults to Reflex Blue with no data-accent attribute", () => {
    renderPicker();
    const group = screen.getByRole("radiogroup", { name: dictionaries.en.accent.label });
    expect(group).toBeTruthy();
    expect(screen.getByRole("radio", { name: dictionaries.en.accent.names.reflex })).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement.hasAttribute("data-accent")).toBe(false);
  });

  it("applies and persists a chosen spot colour", async () => {
    const user = userEvent.setup();
    renderPicker();
    await user.click(screen.getByRole("radio", { name: dictionaries.en.accent.names.green }));
    expect(document.documentElement.getAttribute("data-accent")).toBe("green");
    expect(localStorage.getItem("sz-accent")).toBe("green");
    expect(screen.getByRole("radio", { name: dictionaries.en.accent.names.green })).toHaveAttribute("aria-checked", "true");
  });

  it("restores a stored choice and ignores unknown values", () => {
    localStorage.setItem("sz-accent", "cyan");
    renderPicker();
    expect(document.documentElement.getAttribute("data-accent")).toBe("cyan");
    cleanup();
    document.documentElement.removeAttribute("data-accent");
    localStorage.setItem("sz-accent", "not-a-colour");
    renderPicker();
    expect(document.documentElement.hasAttribute("data-accent")).toBe(false);
  });
});
