/**
 * Grapheme- and word-safe truncation for SEO meta descriptions.
 * Uses Intl.Segmenter when available so Persian ZWNJ / combined characters
 * are never split mid-cluster.
 */
export function truncateDescription(text: string, maxChars = 155): string {
  const raw = (text ?? "").trim();
  if (!raw) return "";
  if (raw.length <= maxChars) return raw;

  let graphemes: string[];
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    graphemes = [...segmenter.segment(raw)].map((s) => s.segment);
  } else {
    graphemes = Array.from(raw);
  }

  if (graphemes.length <= maxChars) return raw;

  const sliced = graphemes.slice(0, maxChars).join("");
  // Prefer the last whitespace boundary so we don't end mid-word when possible.
  const boundary = Math.max(sliced.lastIndexOf(" "), sliced.lastIndexOf("\u200c"));
  const base = boundary >= Math.floor(maxChars * 0.6) ? sliced.slice(0, boundary) : sliced;
  return `${base.trimEnd()}…`;
}
