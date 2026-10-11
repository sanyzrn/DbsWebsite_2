/**
 * Generate PWA PNG icons from the brand mark (public/favicon.svg).
 * Outputs into public/icons/ for vite-plugin-pwa / the web app manifest.
 *
 * Usage: node scripts/generate-pwa-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT } from "./site-url.mjs";

const OUT = path.join(ROOT, "public", "icons");
const SRC_SVG = path.join(ROOT, "public", "favicon.svg");
// Match vite.config.ts PWA_BG and the intro light --page exactly.
// Otherwise Android shows a visible tile around the native splash icon.
const BG = "#ecede8";

fs.mkdirSync(OUT, { recursive: true });

async function renderMark(size) {
  // Rasterize SVG at high resolution then fit into a square with padding.
  return sharp(SRC_SVG, { density: 512 })
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function squareIcon(outSize, markRatio) {
  const markSize = Math.round(outSize * markRatio);
  const mark = await renderMark(markSize);
  const left = Math.round((outSize - markSize) / 2);
  const top = Math.round((outSize - markSize) / 2);
  return sharp({
    create: {
      width: outSize,
      height: outSize,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: mark, left, top }])
    .png()
    .toBuffer();
}

const jobs = [
  // Retain a legible 192px launcher icon; soften larger splash-capable assets.
  // Android controls the actual splash size, and uses these icons for installation too.
  { file: "pwa-192x192.png", size: 192, ratio: 0.72 },
  { file: "pwa-512x512.png", size: 512, ratio: 0.52 },
  // Keep the maskable mark comfortably inside Android’s safe zone.
  { file: "pwa-512x512-maskable.png", size: 512, ratio: 0.43 },
  // Apple touch (180) from the same pipeline for consistency.
  { file: "apple-touch-icon.png", size: 180, ratio: 0.72 },
];

for (const job of jobs) {
  const buf = await squareIcon(job.size, job.ratio);
  const dest =
    job.file === "apple-touch-icon.png"
      ? path.join(ROOT, "public", job.file)
      : path.join(OUT, job.file);
  fs.writeFileSync(dest, buf);
  console.log(`wrote ${path.relative(ROOT, dest)} (${job.size}px, mark ${Math.round(job.ratio * 100)}%)`);
}

console.log("generate-pwa-icons OK");
