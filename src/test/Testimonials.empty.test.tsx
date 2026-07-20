import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import Testimonials from "../components/Testimonials";
import AboutPage from "../pages/AboutPage";
import { AppProvider } from "../lib/app";
import { getLocalizedTestimonials, loadTestimonials } from "../lib/testimonials";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.lang = "fa";
  document.documentElement.dir = "rtl";
});

describe("testimonials scaffold", () => {
  it("loads zero testimonials at launch (no placeholder content)", () => {
    expect(loadTestimonials()).toEqual([]);
    expect(getLocalizedTestimonials("en")).toEqual([]);
    expect(getLocalizedTestimonials("fa")).toEqual([]);
  });

  it("does not render the section when there are no published testimonials", () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Testimonials />
        </AppProvider>
      </MemoryRouter>
    );
    expect(screen.queryByTestId("testimonials-section")).toBeNull();
  });

  it("keeps About page free of an empty testimonials block", () => {
    render(
      <MemoryRouter initialEntries={["/en/about"]}>
        <AppProvider>
          <AboutPage />
        </AppProvider>
      </MemoryRouter>
    );
    expect(screen.queryByTestId("testimonials-section")).toBeNull();
  });
});
