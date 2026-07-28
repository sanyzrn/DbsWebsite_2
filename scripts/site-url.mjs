import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Shared SITE_URL resolution for build scripts and Vite.
 * Default: https://saeedzarrini.ir
 */
export const DEFAULT_SITE_URL = "https://saeedzarrini.ir";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..");

/** Strip trailing slash for consistent joins. */
export function normalizeSiteUrl(raw) {
  const trimmed = String(raw || DEFAULT_SITE_URL).trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error(`SITE_URL must be an absolute http(s) URL, got: ${raw}`);
  }
  return trimmed;
}

export function getSiteUrl(env = process.env) {
  return normalizeSiteUrl(env.SITE_URL || DEFAULT_SITE_URL);
}

export function getSiteHost(siteUrl = getSiteUrl()) {
  return new URL(siteUrl).host;
}

/** Load KEY=VALUE pairs from a .env file into process.env (does not override existing). */
export function loadDotEnv(filePath = path.join(ROOT, ".env")) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const i = trimmed.indexOf("=");
    const key = trimmed.slice(0, i).trim();
    let value = trimmed.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv();
