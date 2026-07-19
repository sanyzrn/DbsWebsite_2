import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import App from "../App";
import Contact from "../components/Contact";
import { AppProvider } from "../lib/app";
import { dictionaries } from "../lib/i18n";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});

beforeEach(() => {
  vi.stubEnv("VITE_FORMSPREE_ID", "");
});

function renderContactPage() {
  return render(
    <MemoryRouter initialEntries={["/en/contact"]}>
      <AppProvider>
        <Routes>
          <Route path="/en/contact" element={<Contact variant="page" />} />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  );
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(new RegExp(dictionaries.en.contact.form.name)), "Saeed Test");
  await user.type(screen.getByLabelText(new RegExp(dictionaries.en.contact.form.email)), "test@example.com");
  await user.type(screen.getByLabelText(new RegExp(dictionaries.en.contact.form.message)), "Hello from the reliability test.");
}

describe("contact form reliability", () => {
  it("exposes a dedicated /contact route with the inline form", () => {
    window.history.pushState(null, "", "/en/contact");
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: dictionaries.en.contact.title })).toBeTruthy();
    expect(screen.getByLabelText(new RegExp(dictionaries.en.contact.form.name))).toBeTruthy();
    expect(screen.getByRole("button", { name: dictionaries.en.contact.form.submit })).toBeTruthy();
  });

  it("uses honest mailed copy and keeps fields after mailto fallback", async () => {
    const user = userEvent.setup();
    let href = "http://localhost/en/contact";
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...window.location,
        get href() {
          return href;
        },
        set href(next: string) {
          href = next;
        },
      },
    });

    renderContactPage();
    await fillRequired(user);
    await new Promise((r) => setTimeout(r, 2100));
    await user.click(screen.getByRole("button", { name: dictionaries.en.contact.form.submit }));

    expect(await screen.findByText(dictionaries.en.contact.form.mailedTitle)).toBeTruthy();
    expect(screen.getByText(dictionaries.en.contact.form.mailedBody)).toBeTruthy();
    expect(screen.getByLabelText(new RegExp(dictionaries.en.contact.form.name))).toHaveValue("Saeed Test");
    expect(href).toMatch(/^mailto:/);
  }, 10_000);

  it("shows timeout state when Formspree fetch aborts", async () => {
    vi.stubEnv("VITE_FORMSPREE_ID", "test-form-id");
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new DOMException("Aborted", "AbortError")))
    );

    renderContactPage();
    await fillRequired(user);
    await new Promise((r) => setTimeout(r, 2100));
    await user.click(screen.getByRole("button", { name: dictionaries.en.contact.form.submit }));

    await waitFor(() => {
      expect(screen.getByText(dictionaries.en.contact.form.timeoutTitle)).toBeTruthy();
    });
  }, 10_000);

  it("quietly rejects honeypot submissions without calling Formspree", async () => {
    vi.stubEnv("VITE_FORMSPREE_ID", "test-form-id");
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderContactPage();
    await fillRequired(user);
    const honeypot = document.getElementById("ct-page-website") as HTMLInputElement;
    expect(honeypot).toBeTruthy();
    honeypot.value = "http://spam.example";
    honeypot.dispatchEvent(new Event("input", { bubbles: true }));
    // React controlled input needs onChange — set via native setter + input event isn't enough.
    await user.type(honeypot, "http://spam.example");

    await new Promise((r) => setTimeout(r, 2100));
    await user.click(screen.getByRole("button", { name: dictionaries.en.contact.form.submit }));

    await waitFor(() => {
      expect(screen.getByText(dictionaries.en.contact.form.deliveredTitle)).toBeTruthy();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  }, 10_000);
});
