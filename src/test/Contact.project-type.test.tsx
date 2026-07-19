import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMemo, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Contact from "../components/Contact";
import { getDictionary, type Lang } from "../lib/i18n";

const { useAppMock } = vi.hoisted(() => ({
  useAppMock: vi.fn(),
}));

vi.mock("../lib/app", async () => {
  const actual = await vi.importActual<typeof import("../lib/app")>("../lib/app");
  return {
    ...actual,
    useApp: () => useAppMock(),
  };
});

beforeEach(() => {
  vi.stubEnv("VITE_FORMSPREE_ID", "test-form-id");
});

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

function ContactWithLangSwitch() {
  const [lang, setLang] = useState<Lang>("fa");
  const value = useMemo(
    () => ({
      lang,
      dir: (lang === "fa" ? "rtl" : "ltr") as "rtl" | "ltr",
      isRTL: lang === "fa",
      t: getDictionary(lang),
      setLang,
      toggleLang: () => setLang((l) => (l === "fa" ? "en" : "fa")),
      theme: "light" as const,
      toggleTheme: () => {},
    }),
    [lang],
  );
  useAppMock.mockImplementation(() => value);

  return (
    <div>
      <button type="button" onClick={() => value.toggleLang()}>
        switch-lang
      </button>
      <Contact />
    </div>
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
