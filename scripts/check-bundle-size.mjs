/**
 * Fail CI if the initial JS or CSS bundle exceeds gzipped size ceilings.
 *
 * Thresholds (gzipped):
 *   JS  ≈ 150 KiB  (current build ~122 KiB — headroom, not unlimited)
 *   CSS ≈  60 KiB  (current build ~14 KiB)
 *
 * Usage: node scripts/check-bundle-size.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { ROOT } from "./site-url.mjs";

const DIST = path.join(ROOT, "dist");
const INDEX = path.join(DIST, "index.html");

/** Soft ceilings — adjust if legitimately close, but keep an explicit gate. */
const MAX_JS_GZIP = 150 * 1024;
const MAX_CSS_GZIP = 60 * 1024;

if (!fs.existsSync(INDEX)) {
  throw new Error("dist/index.html missing — run `npm run build` before check:bundle");
}

const html = fs.readFileSync(INDEX, "utf8");
const jsMatch = html.match(/<script[^>]+src=["']([^"']+\.js)["']/);
const cssMatch = html.match(/<link[^>]+href=["']([^"']+\.css)["'][^>]*rel=["']stylesheet["']/)
  || html.match(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+\.css)["']/);

if (!jsMatch) throw new Error("Could not find initial JS bundle reference in dist/index.html");
if (!cssMatch) throw new Error("Could not find initial CSS bundle reference in dist/index.html");

function resolveAsset(ref) {
  const pathname = ref.startsWith("http") ? new URL(ref).pathname : ref;
  return path.join(DIST, pathname.replace(/^\//, ""));
}

function gzipSize(filePath) {
  const buf = fs.readFileSync(filePath);
  return zlib.gzipSync(buf, { level: 9 }).byteLength;
}

const jsPath = resolveAsset(jsMatch[1]);
const cssPath = resolveAsset(cssMatch[1]);
if (!fs.existsSync(jsPath)) throw new Error(`JS bundle missing: ${jsPath}`);
if (!fs.existsSync(cssPath)) throw new Error(`CSS bundle missing: ${cssPath}`);

const jsGzip = gzipSize(jsPath);
const cssGzip = gzipSize(cssPath);
const fmt = (n) => `${(n / 1024).toFixed(1)} KiB`;

const errors = [];
if (jsGzip > MAX_JS_GZIP) {
  errors.push(`JS gzip ${fmt(jsGzip)} exceeds ceiling ${fmt(MAX_JS_GZIP)} (${path.basename(jsPath)})`);
}
if (cssGzip > MAX_CSS_GZIP) {
  errors.push(`CSS gzip ${fmt(cssGzip)} exceeds ceiling ${fmt(MAX_CSS_GZIP)} (${path.basename(cssPath)})`);
}

console.log(
  `check:bundle — JS ${fmt(jsGzip)} / ${fmt(MAX_JS_GZIP)} · CSS ${fmt(cssGzip)} / ${fmt(MAX_CSS_GZIP)}`
);

if (errors.length) {
  throw new Error(errors.join("\n"));
}

console.log("check:bundle OK");
