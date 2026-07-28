import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMemo, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import Contact from "../components/Contact";
import { AppCtx, type AppState } from "../lib/app";
import { getDictionary, type Lang } from "../lib/i18n";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

/**
 * Provides the AppCtx value directly (no module mocking) so pre-loaded modules
 * like Contact.tsx pick up the controlled context without mock/cache conflicts.
 */
function ContactWithLangSwitch() {
  const [lang, setLang] = useState<Lang>("fa");
  const value = useMemo<AppState>(
    () => ({
      lang,
      dir: (lang === "fa" ? "rtl" : "ltr") as "rtl" | "ltr",
      isRTL: lang === "fa",
      t: getDictionary(lang),
      setLang: (l: Lang) => setLang(l),
      toggleLang: () => setLang((l) => (l === "fa" ? "en" : "fa")),
      theme: "light" as const,
      toggleTheme: () => {},
    }),
    [lang],
  );

  return (
    <AppCtx.Provider value={value}>
      <div>
        <button type="button" onClick={value.toggleLang}>
          switch-lang
        </button>
        <Contact />
      </div>
    </AppCtx.Provider>
  );
}

describe("Contact project type selection", () => {
  it("keeps the same project-type ID selected after a language switch", async () => {
    const user = userEvent.setup();
    const fa = getDictionary("fa");
    const en = getDictionary("en");

    render(
      <MemoryRouter initialEntries={["/about#contact/start"]}>
        <ContactWithLangSwitch />
      </MemoryRouter>,
    );

    const typeSelect = (await screen.findByLabelText(new RegExp(fa.contact.form.type))) as HTMLSelectElement;

    // Options store stable IDs, not translated labels.
    expect([...typeSelect.options].map((o) => o.value)).toContain("web-app");
    expect([...typeSelect.options].map((o) => o.value)).not.toContain(fa.contact.form.types["web-app"]);

    await user.selectOptions(typeSelect, "web-app");
    expect(typeSelect.value).toBe("web-app");
    expect(typeSelect.selectedOptions[0]?.textContent).toBe(fa.contact.form.types["web-app"]);

    await user.click(screen.getByRole("button", { name: "switch-lang" }));

    const typeSelectEn = (await screen.findByLabelText(new RegExp(en.contact.form.type))) as HTMLSelectElement;

    // Same logical selection by ID; visible label follows the new language.
    expect(typeSelectEn.value).toBe("web-app");
    expect(typeSelectEn.selectedOptions[0]?.textContent).toBe(en.contact.form.types["web-app"]);
    expect(typeSelectEn.value).not.toBe(fa.contact.form.types["web-app"]);
    expect(typeSelectEn.value).not.toBe(en.contact.form.types["web-app"]);
  });
});
