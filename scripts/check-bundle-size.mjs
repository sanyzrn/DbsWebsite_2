/**
 * Fail CI if initial JS/CSS, font payload, home HTML, or combined first-paint
 * resources exceed gzipped size ceilings.
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
/**
 * Initial JS entry (gzip). Code-splitting dropped this from ~151 → ~65 KiB;
 * keep headroom for small regressions without letting the entry balloon again.
 */
const MAX_JS_GZIP = 90 * 1024;
/**
 * The MagicDust WebGL chunk (three.js + r3f) is not in the entry graph, so it never
 * counted towards MAX_JS_GZIP — yet a capable desktop fetches it on the home page
 * shortly after paint. Gate it explicitly so a green "JS 64 KiB" cannot hide it.
 */
const MAX_DEFERRED_HERO_JS_GZIP = 260 * 1024;
const MAX_CSS_GZIP = 60 * 1024;
/**
 * All self-hosted font files under dist/assets (fontsource unicode-range subsets).
 * Browsers only fetch matching subsets at runtime; this gates shipped payload regressions.
 * Baseline ≈ 1135 KiB (body stack) + ~180 KiB display serifs (Fraunces opsz + Naskh 600).
 */
const MAX_FONTS_GZIP = 1350 * 1024;
/** Home HTML document. */
const MAX_HTML_GZIP = 80 * 1024;
/**
 * Combined first-paint resources on disk (HTML + critical CSS + critical JS + all font files).
 * Runtime transfer is lower (unicode-range); this is a regression gate, not Lighthouse FMP.
 */
const MAX_FIRST_PAINT_GZIP = 1480 * 1024;

if (!fs.existsSync(INDEX)) {
  throw new Error("dist/index.html missing — run `npm run build` before check:bundle");
}

const html = fs.readFileSync(INDEX, "utf8");
const jsMatch = html.match(/<script[^>]+src=["']([^"']+\.js)["']/);
const cssMatch =
  html.match(/<link[^>]+href=["']([^"']+\.css)["'][^>]*rel=["']stylesheet["']/) ||
  html.match(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+\.css)["']/);

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
const htmlGzip = gzipSize(INDEX);

/** Collect font files under dist/assets (woff/woff2) — first-visit Persian+English stack. */
function collectFontFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const st = fs.statSync(abs);
    if (st.isDirectory()) out.push(...collectFontFiles(abs));
    else if (/\.(woff2?|ttf|otf)$/i.test(name)) out.push(abs);
  }
  return out;
}

const fontFiles = collectFontFiles(path.join(DIST, "assets"));
const fontsGzip = fontFiles.reduce((sum, f) => sum + gzipSize(f), 0);
const firstPaintGzip = htmlGzip + cssGzip + jsGzip + fontsGzip;

/** Home-page chunks fetched after paint rather than through the entry graph. */
const assetsDir = path.join(DIST, "assets");
const deferredHeroFiles = fs.existsSync(assetsDir)
  ? fs
      .readdirSync(assetsDir)
      .filter((name) => /^magic-dust-shader-.*\.js$/.test(name))
      .map((name) => path.join(assetsDir, name))
  : [];
const deferredHeroGzip = deferredHeroFiles.reduce((sum, f) => sum + gzipSize(f), 0);

const fmt = (n) => `${(n / 1024).toFixed(1)} KiB`;
const errors = [];

if (jsGzip > MAX_JS_GZIP) {
  errors.push(`JS gzip ${fmt(jsGzip)} exceeds ceiling ${fmt(MAX_JS_GZIP)} (${path.basename(jsPath)})`);
}
if (deferredHeroGzip > MAX_DEFERRED_HERO_JS_GZIP) {
  errors.push(
    `Deferred hero JS gzip ${fmt(deferredHeroGzip)} exceeds ceiling ${fmt(MAX_DEFERRED_HERO_JS_GZIP)} ` +
      `(${deferredHeroFiles.map((f) => path.basename(f)).join(", ")})`
  );
}
if (cssGzip > MAX_CSS_GZIP) {
  errors.push(`CSS gzip ${fmt(cssGzip)} exceeds ceiling ${fmt(MAX_CSS_GZIP)} (${path.basename(cssPath)})`);
}
if (htmlGzip > MAX_HTML_GZIP) {
  errors.push(`Home HTML gzip ${fmt(htmlGzip)} exceeds ceiling ${fmt(MAX_HTML_GZIP)}`);
}
if (fontsGzip > MAX_FONTS_GZIP) {
  errors.push(
    `Font payload gzip ${fmt(fontsGzip)} exceeds ceiling ${fmt(MAX_FONTS_GZIP)} (${fontFiles.length} files)`
  );
}
if (firstPaintGzip > MAX_FIRST_PAINT_GZIP) {
  errors.push(
    `First-paint total gzip ${fmt(firstPaintGzip)} exceeds ceiling ${fmt(MAX_FIRST_PAINT_GZIP)}`
  );
}

console.log(
  `check:bundle — JS ${fmt(jsGzip)}/${fmt(MAX_JS_GZIP)} · ` +
    `deferred hero JS ${fmt(deferredHeroGzip)}/${fmt(MAX_DEFERRED_HERO_JS_GZIP)} · ` +
    `CSS ${fmt(cssGzip)}/${fmt(MAX_CSS_GZIP)} · ` +
    `HTML ${fmt(htmlGzip)}/${fmt(MAX_HTML_GZIP)} · fonts ${fmt(fontsGzip)}/${fmt(MAX_FONTS_GZIP)} · ` +
    `first-paint ${fmt(firstPaintGzip)}/${fmt(MAX_FIRST_PAINT_GZIP)}`
);

if (errors.length) {
  throw new Error(errors.join("\n"));
}

console.log("check:bundle OK");
