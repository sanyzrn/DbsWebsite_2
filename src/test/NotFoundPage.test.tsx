import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "../lib/app";
import NotFoundPage from "../pages/NotFoundPage";
import { dictionaries } from "../lib/i18n";

function render404(path = "/missing-page") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  );
}

afterEach(() => cleanup());

describe("NotFoundPage", () => {
  it("keeps accessible copy and home CTA while marking the atmosphere decorative", () => {
    const { container } = render404();
    const copy = dictionaries.fa.notFound;

    expect(screen.getByRole("heading", { level: 1, name: copy.title })).toBeVisible();
    expect(screen.getByText(copy.body)).toBeVisible();
    const home = screen.getByRole("link", { name: copy.home });
    expect(home).toHaveAttribute("href", "/");

    const decor = container.querySelector(".nf-atmosphere");
    expect(decor).toHaveAttribute("aria-hidden", "true");
    expect(within(decor as HTMLElement).queryByRole("heading")).toBeNull();
  });

  it("uses /en home link on English routes", () => {
    render404("/en/missing");
    expect(screen.getByRole("link", { name: dictionaries.en.notFound.home })).toHaveAttribute("href", "/en");
    expect(screen.getByRole("heading", { level: 1, name: dictionaries.en.notFound.title })).toBeVisible();
  });
});
