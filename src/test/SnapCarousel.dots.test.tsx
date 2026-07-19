import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SnapCarousel } from "../components/ui";

afterEach(() => {
  cleanup();
});

describe("SnapCarousel pagination dots", () => {
  it("uses plain buttons with aria-current, not tab roles, and a ≥24px hit area", () => {
    render(
      <SnapCarousel label="Demo carousel">
        <div>One</div>
        <div>Two</div>
        <div>Three</div>
      </SnapCarousel>
    );

    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();

    const dots = screen.getAllByRole("button", { name: /\d+ \/ 3/ });
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    expect(dots[1]).not.toHaveAttribute("aria-current");

    // Hit target is at least 24×24 via h-6 / min-w-6; visible mark stays h-1.5.
    expect(dots[0]!.className).toMatch(/\bh-6\b/);
    expect(dots[0]!.className).toMatch(/\bmin-w-6\b/);
    const mark = dots[0]!.querySelector("[aria-hidden='true']");
    expect(mark?.className).toMatch(/\bh-1\.5\b/);

    // Slide wrappers keep the existing slide semantics.
    const slides = document.querySelectorAll('[aria-roledescription="slide"]');
    expect(slides.length).toBe(3);
    expect(slides[0]).toHaveAttribute("aria-label", "1 / 3");
  });
});
