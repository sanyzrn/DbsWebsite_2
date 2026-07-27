import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import Contact from "../components/Contact";
import { AppProvider } from "../lib/app";
import { dictionaries } from "../lib/i18n";

const fa = dictionaries.fa;

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function renderContact(initialEntries = ["/contact"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AppProvider>
        <Contact variant="page" />
      </AppProvider>
    </MemoryRouter>
  );
}

/** The disclosure wrapping every non-required field. */
function optionalDetails(): HTMLDetailsElement {
  const summary = screen.getByText(fa.contact.form.optionalDetails);
  const details = summary.closest("details");
  if (!details) throw new Error("optional-details <details> not found");
  return details as HTMLDetailsElement;
}

describe("Contact form optional details", () => {
  it("keeps only name, email and message outside the disclosure", () => {
    renderContact();
    const details = optionalDetails();

    for (const label of [fa.contact.form.name, fa.contact.form.email, fa.contact.form.message]) {
      const field = screen.getByLabelText(new RegExp(label));
      expect(details.contains(field)).toBe(false);
    }

    for (const label of [
      fa.contact.form.phone,
      fa.contact.form.company,
      fa.contact.form.type,
      fa.contact.form.budget,
      fa.contact.form.timeline,
    ]) {
      const field = screen.getByLabelText(new RegExp(label));
      expect(details.contains(field)).toBe(true);
    }
  });

  it("starts collapsed for a plain visit", () => {
    renderContact();
    expect(optionalDetails().open).toBe(false);
  });

  it("opens itself when a project link prefills the project type", async () => {
    renderContact(["/contact?project=dbspulse"]);

    await waitFor(() => {
      expect(optionalDetails().open).toBe(true);
    });

    const type = screen.getByLabelText(new RegExp(fa.contact.form.type)) as HTMLSelectElement;
    expect(type.value).toBe("web-app");
  });
});
