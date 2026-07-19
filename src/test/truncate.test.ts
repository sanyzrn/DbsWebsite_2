import { describe, expect, it } from "vitest";
import { truncateDescription } from "../lib/truncate";

describe("truncateDescription", () => {
  it("returns short text unchanged", () => {
    expect(truncateDescription("Hello world", 155)).toBe("Hello world");
  });

  it("truncates at a word boundary and appends an ellipsis", () => {
    const long = "alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo";
    const out = truncateDescription(long, 40);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(41);
    expect(out.includes("india")).toBe(false);
  });

  it("does not split a Persian ZWNJ grapheme cluster mid-character", () => {
    // "می‌خواهم" contains ZWNJ (U+200C) between ی and خ
    const phrase = "من می‌خواهم یک محصول واقعی بسازم که برای تیم‌ها مفید باشد و در عمل کار کند";
    const out = truncateDescription(phrase, 25);
    expect(out.endsWith("…")).toBe(true);
    // Should not end with a lone ZWNJ
    expect(out.charCodeAt(out.length - 2)).not.toBe(0x200c);
  });
});
