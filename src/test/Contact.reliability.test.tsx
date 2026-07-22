import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import App from "../App";
import Contact from "../components/Contact";
import { AppProvider } from "../lib/app";
import { dictionaries } from "../lib/i18n";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
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
  it("always shows the interactive form (Telegram PHP proxy path)", () => {
    window.history.pushState(null, "", "/en/contact");
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: dictionaries.en.contact.title })).toBeTruthy();
    expect(screen.getByLabelText(new RegExp(dictionaries.en.contact.form.name))).toBeTruthy();
    expect(screen.getByRole("button", { name: dictionaries.en.contact.form.submit })).toBeTruthy();
    const emailLinks = screen.getAllByRole("link", { name: dictionaries.en.contact.email });
    expect(emailLinks.some((a) => a.getAttribute("href") === `mailto:${dictionaries.en.contact.email}`)).toBe(
      true
    );
  });

  it("POSTs to /api/contact.php and shows timeout when the fetch aborts", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(() => Promise.reject(new DOMException("Aborted", "AbortError")));
    vi.stubGlobal("fetch", fetchMock);

    renderContactPage();
    await fillRequired(user);
    await new Promise((r) => setTimeout(r, 2100));
    await user.click(screen.getByRole("button", { name: dictionaries.en.contact.form.submit }));

    await waitFor(() => {
      expect(screen.getByText(dictionaries.en.contact.form.timeoutTitle)).toBeTruthy();
    });
    expect(fetchMock).toHaveBeenCalled();
    const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const [url, init] = call;
    expect(url).toBe("/api/contact.php");
    expect(init.method).toBe("POST");
    const body = JSON.parse(String(init.body)) as { elapsedMs: number; website: string };
    expect(body.elapsedMs).toBeGreaterThanOrEqual(2000);
    expect(body.website).toBe("");
  }, 10_000);

  it("shows delivered on ok:true from the contact API", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ ok: true }),
        })
      )
    );

    renderContactPage();
    await fillRequired(user);
    await new Promise((r) => setTimeout(r, 2100));
    await user.click(screen.getByRole("button", { name: dictionaries.en.contact.form.submit }));

    await waitFor(() => {
      expect(screen.getByText(dictionaries.en.contact.form.deliveredTitle)).toBeTruthy();
    });
  }, 10_000);
});
