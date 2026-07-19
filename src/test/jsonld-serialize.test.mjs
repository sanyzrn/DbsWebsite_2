import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "../../scripts/jsonld-serialize.mjs";
import { buildHeadTags } from "../../scripts/prerender.mjs";

describe("JSON-LD script embedding", () => {
  it("escapes </script> and Unicode line separators in serializeJsonLd", () => {
    const raw = {
      name: "Breakout </script><script>alert(1)</script>",
      description: "Line\u2028sep and\u2029para",
    };
    const out = serializeJsonLd(raw);

    expect(out).not.toContain("<");
    expect(out).not.toContain("\u2028");
    expect(out).not.toContain("\u2029");
    expect(out).toContain("\\u003C/script>");
    expect(out).toContain("\\u2028");
    expect(out).toContain("\\u2029");

    // Round-trip: parsers still recover the original strings.
    expect(JSON.parse(out)).toEqual(raw);
  });

  it("does not emit a raw </script> inside JSON-LD when a project name contains it", () => {
    // Simulates authored project content flowing through prerender head injection.
    const seo = {
      path: "/en/projects/evil-script",
      title: "Evil project",
      description: "Portfolio case study",
      canonical: "https://example.test/en/projects/evil-script",
      alternateFa: "https://example.test/projects/evil-script",
      alternateEn: "https://example.test/en/projects/evil-script",
      ogLocale: "en_US",
      ogLocaleAlternate: "fa_IR",
      image: "https://example.test/og.jpg",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: "Demo </script><script>document.cookie</script> Project",
          description: "Summary with </script> and a\u2028break",
        },
      ],
    };

    const head = buildHeadTags(seo, "en");
    const match = head.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    expect(match).toBeTruthy();
    const inner = match[1];

    // No unescaped closing tag in the middle of the JSON-LD payload.
    expect(inner).not.toContain("</script>");
    expect(inner).toContain("\\u003C/script>");

    const parsed = JSON.parse(inner);
    expect(parsed.name).toContain("</script>");
    expect(parsed.description).toContain("</script>");
    expect(parsed.description).toContain("\u2028");
  });
});
