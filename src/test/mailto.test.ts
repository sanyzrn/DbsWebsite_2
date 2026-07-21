import { describe, expect, it } from "vitest";
import { DEFAULT_PROJECT_TYPE } from "../lib/i18n";
import { MAILTO_SAFE, buildMailto, type ContactFields } from "../lib/mailto";

function fields(overrides: Partial<ContactFields> = {}): ContactFields {
  return {
    name: "Saeed Test",
    email: "test@example.com",
    company: "",
    type: DEFAULT_PROJECT_TYPE,
    message: "Short hello.",
    budget: "",
    timeline: "",
    ...overrides,
  };
}

describe("buildMailto", () => {
  it("does not truncate a short message", () => {
    const result = buildMailto(fields({ message: "Hello, I need a website." }), "Website");
    expect(result.truncated).toBe(false);
    expect(result.href).toContain("mailto:");
  });

  it("truncates a very long message and keeps encoded body near MAILTO_SAFE", () => {
    const longMessage = "A".repeat(5000);
    const result = buildMailto(fields({ message: longMessage }), "Website");
    expect(result.truncated).toBe(true);

    const bodyEncoded = new URL(result.href).searchParams.get("body")!;
    // searchParams already decodes; re-encode to measure URL payload size
    const encodedLen = encodeURIComponent(bodyEncoded).length;
    expect(encodedLen).toBeLessThanOrEqual(MAILTO_SAFE);
    // Still using most of the budget — not truncated to nothing
    expect(encodedLen).toBeGreaterThan(MAILTO_SAFE * 0.5);
  });

  it("includes name, email, and type in the body", () => {
    const result = buildMailto(
      fields({
        name: "Ada Lovelace",
        email: "ada@example.com",
        type: "ui-ux",
        message: "Need a rebrand.",
      }),
      "UI / UX"
    );
    const body = decodeURIComponent(result.href.split("body=")[1] ?? "");
    expect(body).toContain("Name: Ada Lovelace");
    expect(body).toContain("Email: ada@example.com");
    expect(body).toContain("Project type: UI / UX (ui-ux)");
  });
});
