import { describe, expect, it } from "vitest";
import { nexPageStyles } from "../../scripts/nex-page-styles.mjs";

const manifest = {
  "src/pages/NexLandingPage.tsx": { css: ["assets/nex.css"], imports: ["shared"] },
  shared: { css: ["assets/shared.css", "assets/nex.css"] },
};
describe("prerendered Nex CSS", () => {
  it.each(["/nex", "/nex/", "/en/nex", "/en/nex/"])("resolves direct and shared styles once for %s", (path) => {
    expect(nexPageStyles(path, manifest)).toEqual(["/assets/nex.css", "/assets/shared.css"]);
  });
  it.each(["/", "/about", "/nexahr", "/en/nexaslider"])("keeps other routes unchanged: %s", (path) => {
    expect(nexPageStyles(path, {})).toEqual([]);
  });
  it("includes each subpage's own stylesheet and shared Nex styles", () => {
    expect(nexPageStyles("/en/nex/guide", { "src/pages/nex/NexGuidePage.tsx": { css: ["assets/guide.css"], imports: ["frame"] }, frame: { css: ["assets/frame.css"] } })).toEqual(["/assets/guide.css", "/assets/frame.css"]);
  });
  it("fails a build with missing Nex CSS rather than shipping an unstyled page", () => {
    expect(() => nexPageStyles("/nex", {})).toThrow(/missing/i);
    expect(() => nexPageStyles("/nex", { "src/pages/NexLandingPage.tsx": {} })).toThrow(/CSS/);
  });
});
