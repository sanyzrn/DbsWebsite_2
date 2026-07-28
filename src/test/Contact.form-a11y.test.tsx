import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Contact from "../components/Contact";
import { AppProvider } from "../lib/app";
import { dictionaries } from "../lib/i18n";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
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

describe("Contact form field error association", () => {
  it("marks invalid fields with aria-invalid and aria-describedby pointing at the error message", async () => {
    const user = userEvent.setup();
    renderContactPage();

    const submit = screen.getByRole("button", { name: dictionaries.en.contact.form.submit });
    await user.click(submit);

    const name = screen.getByLabelText(new RegExp(dictionaries.en.contact.form.name));
    expect(name).toHaveAttribute("aria-invalid", "true");
    const nameDescribedBy = name.getAttribute("aria-describedby");
    expect(nameDescribedBy).toBeTruthy();
    const nameErr = document.getElementById(nameDescribedBy!);
    expect(nameErr?.textContent).toBe(dictionaries.en.contact.form.required);

    await waitFor(() => {
      expect(name).toHaveFocus();
    });
  });

  it("exposes submission failures as role=alert and focuses them", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new DOMException("Aborted", "AbortError")))
    );

    renderContactPage();
    await user.type(screen.getByLabelText(new RegExp(dictionaries.en.contact.form.name)), "Saeed");
    await user.type(screen.getByLabelText(new RegExp(dictionaries.en.contact.form.email)), "a@b.co");
    await user.type(screen.getByLabelText(new RegExp(dictionaries.en.contact.form.message)), "Hello there");
    await new Promise((r) => setTimeout(r, 2100));
    await user.click(screen.getByRole("button", { name: dictionaries.en.contact.form.submit }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(dictionaries.en.contact.form.timeoutTitle);
    await waitFor(() => {
      expect(alert).toHaveFocus();
    });
  }, 10_000);
});
