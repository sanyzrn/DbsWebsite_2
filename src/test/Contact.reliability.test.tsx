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
  it("without Formspree, shows a static setup message and direct email link (no form fields)", () => {
    window.history.pushState(null, "", "/en/contact");
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: dictionaries.en.contact.title })).toBeTruthy();
    expect(screen.getByText(dictionaries.en.contact.form.formUnavailable)).toBeTruthy();
    const emailLinks = screen.getAllByRole("link", { name: dictionaries.en.contact.email });
    expect(emailLinks.some((a) => a.getAttribute("href") === `mailto:${dictionaries.en.contact.email}`)).toBe(
      true
    );
    expect(screen.queryByLabelText(new RegExp(dictionaries.en.contact.form.name))).toBeNull();
    expect(screen.queryByRole("button", { name: dictionaries.en.contact.form.submit })).toBeNull();
  });

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
});
