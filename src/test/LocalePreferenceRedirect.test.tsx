import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { dictionaries } from "../lib/i18n";

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.documentElement.lang = "fa";
  document.documentElement.dir = "rtl";
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});

async function toggleLang(user: ReturnType<typeof userEvent.setup>, lang: "fa" | "en") {
  const label = lang === "en" ? dictionaries.en.nav.switchLangLabel : dictionaries.fa.nav.switchLangLabel;
  await user.click(screen.getByRole("button", { name: label }));
}

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

    await toggleLang(user, "en");

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

  it("does not re-fire after a first-load preference redirect when switching back to Persian", async () => {
    const user = userEvent.setup();
    localStorage.setItem("sz-lang", "en");
    window.history.replaceState(null, "", "/");
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/en");
      expect(document.documentElement.lang).toBe("en");
    });

    // Explicit Persian choice after the one-shot preference redirect.
    await toggleLang(user, "en");

    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
      expect(document.documentElement.lang).toBe("fa");
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(window.location.pathname).toBe("/");
    expect(document.documentElement.lang).toBe("fa");

    // Repeated toggles within the same session must stay stable.
    await toggleLang(user, "fa");
    await waitFor(() => expect(window.location.pathname).toBe("/en"));
    await toggleLang(user, "en");
    await waitFor(() => expect(window.location.pathname).toBe("/"));
    await toggleLang(user, "fa");
    await waitFor(() => expect(window.location.pathname).toBe("/en"));
    await toggleLang(user, "en");
    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
      expect(document.documentElement.lang).toBe("fa");
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(window.location.pathname).toBe("/");
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

  it("preserves query params and hash in correct URL order when switching language", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/about?ref=nav&from=footer#contact");
    render(<App />);

    expect(document.documentElement.lang).toBe("fa");
    expect(window.location.search).toBe("?ref=nav&from=footer");
    expect(window.location.hash).toBe("#contact");

    await toggleLang(user, "fa");

    await waitFor(() => {
      expect(window.location.pathname).toBe("/en/about");
      expect(window.location.search).toBe("?ref=nav&from=footer");
      expect(window.location.hash).toBe("#contact");
      // pathname → search → hash (never pathname + hash + search)
      expect(`${window.location.pathname}${window.location.search}${window.location.hash}`).toBe(
        "/en/about?ref=nav&from=footer#contact",
      );
      expect(window.location.href).not.toMatch(/#contact\?/);
    });

    await toggleLang(user, "en");

    await waitFor(() => {
      expect(window.location.pathname).toBe("/about");
      expect(window.location.search).toBe("?ref=nav&from=footer");
      expect(window.location.hash).toBe("#contact");
      expect(`${window.location.pathname}${window.location.search}${window.location.hash}`).toBe(
        "/about?ref=nav&from=footer#contact",
      );
    });
  });
});
