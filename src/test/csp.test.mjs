import { describe, expect, it } from "vitest";
import {
  buildCspHeader,
  collectStyleAttributeHashes,
  sha256Integrity,
} from "../../scripts/csp.mjs";

describe("csp helpers", () => {
  it("sha256Integrity returns a 'sha256-<base64>' token", () => {
    const h = sha256Integrity("hello");
    expect(h).toMatch(/^'sha256-[A-Za-z0-9+/]+=*'$/);
    expect(sha256Integrity("hello")).toBe(sha256Integrity("hello"));
    expect(sha256Integrity("hello")).not.toBe(sha256Integrity("world"));
  });

  it("buildCspHeader with no hashes emits plain script-src 'self'", () => {
    const csp = buildCspHeader({});
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain("'sha256-");
    expect(csp).not.toContain("nonce");
    expect(csp).not.toContain("unsafe-inline");
  });

  it("buildCspHeader embeds script hashes and omits unsafe-inline", () => {
    const h1 = sha256Integrity("window.__BOOT=1");
    const h2 = sha256Integrity('{"@type":"WebSite"}');
    const csp = buildCspHeader({ scriptHashes: [h1, h2] });
    expect(csp).toContain(`script-src 'self' ${[h1, h2].sort().join(" ")}`);
    expect(csp).not.toContain("nonce");
    expect(csp).not.toContain("unsafe-inline");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("buildCspHeader deduplicates script hashes", () => {
    const h = sha256Integrity("dup");
    const csp = buildCspHeader({ scriptHashes: [h, h, h] });
    const matches = csp.match(/'sha256-/g);
    expect(matches?.length).toBe(1);
  });

  it("buildCspHeader forMeta omits frame-ancestors", () => {
    const h = sha256Integrity("x");
    const csp = buildCspHeader({ scriptHashes: [h], forMeta: true });
    expect(csp).not.toContain("frame-ancestors");
    expect(csp).toContain(h);
  });

  it("buildCspHeader includes unique style hashes with unsafe-hashes", () => {
    const h1 = sha256Integrity("color:red");
    const h2 = sha256Integrity("color:blue");
    const csp = buildCspHeader({ styleHashes: [h1, h2, h1] });
    expect(csp).toContain("'unsafe-hashes'");
    expect(csp).toContain(h1);
    expect(csp).toContain(h2);
    expect(csp.match(/'sha256-/g)?.length).toBe(2);
  });

  it("collectStyleAttributeHashes finds double- and single-quoted styles", () => {
    const html = `<div style="width:10px"></div><span style='color:red'></span>`;
    const hashes = collectStyleAttributeHashes(html);
    expect(hashes).toContain(sha256Integrity("width:10px"));
    expect(hashes).toContain(sha256Integrity("color:red"));
  });
});
