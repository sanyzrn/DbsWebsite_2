import { describe, expect, it } from "vitest";
import { AXE_RUN_OPTIONS } from "../../scripts/check-a11y.mjs";

describe("check-a11y contrast config", () => {
  it("enables axe color-contrast (no longer skipped for jsdom)", () => {
    expect(AXE_RUN_OPTIONS.rules["color-contrast"].enabled).toBe(true);
  });
});
