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
const BG = "#f5f0e8"; // --page (light)

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
  // Standard icons — logo fills most of the canvas with light padding.
  { file: "pwa-192x192.png", size: 192, ratio: 0.72 },
  { file: "pwa-512x512.png", size: 512, ratio: 0.72 },
  // Maskable — keep brand content inside the ~80% safe zone (logo ~55–60%).
  { file: "pwa-512x512-maskable.png", size: 512, ratio: 0.55 },
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
