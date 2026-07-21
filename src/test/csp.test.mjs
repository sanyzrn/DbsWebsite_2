import { describe, expect, it } from "vitest";
import {
  applyNonceToHtml,
  buildCspHeader,
  collectStyleAttributeHashes,
  createBuildNonce,
  sha256Integrity,
} from "../../scripts/csp.mjs";

describe("csp helpers", () => {
  it("createBuildNonce returns a non-empty base64url token", () => {
    const a = createBuildNonce();
    const b = createBuildNonce();
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a.length).toBeGreaterThanOrEqual(16);
    expect(a).not.toBe(b);
  });

  it("buildCspHeader uses nonce for scripts and omits unsafe-inline", () => {
    const csp = buildCspHeader({ nonce: "testNonceValue", styleHashes: [] });
    expect(csp).toContain("script-src 'self' 'nonce-testNonceValue'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("unsafe-inline");
  });

  it("buildCspHeader forMeta omits frame-ancestors", () => {
    const csp = buildCspHeader({ nonce: "n", styleHashes: [], forMeta: true });
    expect(csp).not.toContain("frame-ancestors");
    expect(csp).toContain("script-src 'self' 'nonce-n'");
  });

  it("buildCspHeader includes unique style hashes with unsafe-hashes", () => {
    const h1 = sha256Integrity("color:red");
    const h2 = sha256Integrity("color:blue");
    const csp = buildCspHeader({ nonce: "n", styleHashes: [h1, h2, h1] });
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

  it("applyNonceToHtml stamps FOUC script, JSON-LD, and csp-nonce meta", () => {
    const html = `<!doctype html><html><head></head><body>
      <script>window.__BOOT=1</script>
      <script type="application/ld+json">{"@type":"WebSite"}</script>
    </body></html>`;
    const out = applyNonceToHtml(html, "abc123");
    expect(out).toContain('<script nonce="abc123">');
    expect(out).toContain('<script nonce="abc123" type="application/ld+json">');
    expect(out).toContain('<meta name="csp-nonce" content="abc123" />');
  });
});
