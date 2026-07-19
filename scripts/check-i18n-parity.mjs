/**
 * Fail if fa/en UI dictionaries diverge in nested key shape.
 * Usage: node scripts/check-i18n-parity.mjs
 */
import fa from "../src/lib/i18n/fa.ts";
import en from "../src/lib/i18n/en.ts";

function keyPaths(value, prefix = "") {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }
  const keys = Object.keys(value).sort();
  if (!keys.length) return prefix ? [prefix] : [];
  return keys.flatMap((k) => keyPaths(value[k], prefix ? `${prefix}.${k}` : k));
}

const faKeys = new Set(keyPaths(fa));
const enKeys = new Set(keyPaths(en));
const missingInEn = [...faKeys].filter((k) => !enKeys.has(k));
const missingInFa = [...enKeys].filter((k) => !faKeys.has(k));

if (missingInEn.length || missingInFa.length) {
  const parts = [];
  if (missingInEn.length) parts.push(`Missing in en:\n  - ${missingInEn.join("\n  - ")}`);
  if (missingInFa.length) parts.push(`Missing in fa:\n  - ${missingInFa.join("\n  - ")}`);
  throw new Error(`i18n key parity failed:\n\n${parts.join("\n\n")}`);
}

console.log(`check:i18n-parity OK — ${faKeys.size} nested keys match in fa/en`);
