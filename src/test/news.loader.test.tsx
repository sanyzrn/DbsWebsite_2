import { describe, expect, it } from "vitest";
import { getLocalizedNewsItems, loadNewsItems } from "../lib/news";

describe("news loader", () => {
  it("loads an empty digest list at launch (no placeholder items)", () => {
    expect(loadNewsItems()).toEqual([]);
    expect(getLocalizedNewsItems("en")).toEqual([]);
    expect(getLocalizedNewsItems("fa")).toEqual([]);
  });
});
