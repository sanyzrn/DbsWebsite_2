import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Slider } from "../components/ui";
import { AppProvider } from "../lib/app";

const OriginalIntersectionObserver = window.IntersectionObserver;

function renderSlider(count: number, locale = "/en") {
  return render(
    <MemoryRouter initialEntries={[locale]}>
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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.IntersectionObserver = OriginalIntersectionObserver;
  localStorage.clear();
});

describe("Slider", () => {
  it.each(["/", "/en"])("aligns dots to the padded logical start on %s", (locale) => {
    renderSlider(3, locale);
    const root = screen.getByRole("region", { name: "Work" });
    const slide = root.children[1] as HTMLElement;
    const scrollBy = vi.fn();
    root.scrollBy = scrollBy;
    vi.spyOn(root, "getBoundingClientRect").mockReturnValue({ left: 10, right: 410 } as DOMRect);
    vi.spyOn(slide, "getBoundingClientRect").mockReturnValue({ left: -320, right: 100 } as DOMRect);
    root.style.scrollPaddingLeft = "20px";
    root.style.scrollPaddingRight = "20px";
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(scrollBy).toHaveBeenCalledWith({ left: locale === "/" ? -290 : -350, behavior: "smooth" });
  });

  it("compares all visible slides when only one observer entry changes", () => {
    let observe!: (entries: Partial<IntersectionObserverEntry>[]) => void;
    window.IntersectionObserver = class {
      constructor(callback: typeof observe) { observe = callback; }
      observe() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
    renderSlider(3);
    const slides = screen.getByRole("region", { name: "Work" }).children;
    const dots = screen.getAllByRole("button");
    act(() => observe([
      { target: slides[0], isIntersecting: true, intersectionRatio: 0.9 },
      { target: slides[1], isIntersecting: true, intersectionRatio: 0.6 },
    ]));
    act(() => observe([{ target: slides[1], isIntersecting: true, intersectionRatio: 0.8 }]));
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    act(() => observe([{ target: slides[0], isIntersecting: true, intersectionRatio: 0.2 }]));
    expect(dots[1]).toHaveAttribute("aria-current", "true");
  });

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
