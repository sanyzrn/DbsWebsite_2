import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { dictionaries } from "../lib/i18n";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  window.history.replaceState(null, "", "/");
});

describe("optional browser preferences", () => {
  it.each(["getItem", "setItem"] as const)("keeps rendering and changing language/theme when %s throws", async (method) => {
    vi.spyOn(Storage.prototype, method).mockImplementation(() => {
      throw new DOMException("Storage is blocked", "SecurityError");
    });
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/en");
    render(<App />);
    await user.click(screen.getByRole("button", { name: dictionaries.en.theme.toDark }));
    expect(document.documentElement).toHaveClass("dark");
    await user.click(screen.getByRole("button", { name: dictionaries.en.nav.switchLangLabel }));
    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
      expect(document.documentElement.lang).toBe("fa");
    });
  });
});
