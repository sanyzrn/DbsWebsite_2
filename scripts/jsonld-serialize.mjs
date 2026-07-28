/**
 * Serialize JSON for embedding inside <script type="application/ld+json">.
 * Escapes characters that can break out of or confuse an inline script context.
 */
export function serializeJsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003C")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
