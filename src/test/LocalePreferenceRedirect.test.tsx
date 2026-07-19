import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { dictionaries } from "../lib/i18n";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.documentElement.lang = "fa";
  document.documentElement.dir = "rtl";
  window.history.replaceState(null, "", "/");
});

describe("locale preference + language switch", () => {
  it("redirects first visit to / toward /en when sz-lang is en", async () => {
    localStorage.setItem("sz-lang", "en");
    window.history.replaceState(null, "", "/");
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/en");
      expect(document.documentElement.lang).toBe("en");
    });
  });

  it("stays on Persian after switching English → Persian (no bounce back)", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/en");
    render(<App />);

    expect(document.documentElement.lang).toBe("en");

    await user.click(screen.getByRole("button", { name: dictionaries.en.nav.switchLangLabel }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
      expect(document.documentElement.lang).toBe("fa");
      expect(localStorage.getItem("sz-lang")).toBe("fa");
    });

    // Give any deferred redirect a chance to fire — it must not flip back.
    await new Promise((r) => setTimeout(r, 50));
    expect(window.location.pathname).toBe("/");
    expect(document.documentElement.lang).toBe("fa");
  });

  it("still redirects first visit under StrictMode", async () => {
    localStorage.setItem("sz-lang", "en");
    window.history.replaceState(null, "", "/");
    render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    await waitFor(() => {
      expect(window.location.pathname).toBe("/en");
      expect(document.documentElement.lang).toBe("en");
    });
  });
});
