import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { Slider } from "../components/ui";
import { AppProvider } from "../lib/app";

function renderSlider(count: number) {
  return render(
    <MemoryRouter initialEntries={["/en"]}>
      <AppProvider>
        <Slider label="Work">
          {Array.from({ length: count }, (_, i) => (
            <article key={i}>Slide {i + 1}</article>
          ))}
        </Slider>
      </AppProvider>
    </MemoryRouter>
  );
}

afterEach(() => cleanup());

describe("Slider", () => {
  it("exposes a labelled carousel with one slide per child and a dot per slide", () => {
    renderSlider(3);
    const region = screen.getByRole("region", { name: "Work" });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    expect(region.querySelectorAll('[aria-roledescription="slide"]')).toHaveLength(3);
    const dots = screen.getAllByRole("button", { name: /\d \/ 3/ });
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveAttribute("aria-current", "true");
  });

  it("drops the pager for a single slide", () => {
    renderSlider(1);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
