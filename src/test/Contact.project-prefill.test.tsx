import { cleanup, render, screen, waitFor } from "@testing-library/react";
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

function renderContactWithProject(search: string) {
  return render(
    <MemoryRouter initialEntries={[`/en/contact${search}`]}>
      <AppProvider>
        <Routes>
          <Route path="/en/contact" element={<Contact variant="page" />} />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  );
}

describe("Contact form project query prefill", () => {
  it("pre-fills the message with the project display name for ?project=dbspulse", async () => {
    renderContactWithProject("?project=dbspulse");

    const message = await screen.findByLabelText(new RegExp(dictionaries.en.contact.form.message));
    await waitFor(() => {
      expect((message as HTMLTextAreaElement).value).toContain("DbsPulse");
    });
    expect((message as HTMLTextAreaElement).value).toMatch(/^Regarding:\s*DbsPulse/);
    // Full-Stack tag on DbsPulse maps to web-app
    const type = screen.getByLabelText(new RegExp(dictionaries.en.contact.form.type)) as HTMLSelectElement;
    expect(type.value).toBe("web-app");
  });

  it("leaves the form empty when the project slug is unknown", async () => {
    renderContactWithProject("?project=does-not-exist");

    const message = await screen.findByLabelText(new RegExp(dictionaries.en.contact.form.message));
    expect((message as HTMLTextAreaElement).value).toBe("");
  });
});
