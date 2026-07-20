/**
 * Safe project-image processing for the file-based content workflow.
 * Replaces the useful bits of admin/src/ImageHandler.php without a running PHP server.
 *
 * Usage:
 *   node scripts/optimize-image.mjs <path-to-raw-image> <project-slug>
 *   node scripts/optimize-image.mjs ./raw/hero.jpg dbspulse
 *   node scripts/optimize-image.mjs ./raw/hero.png dbspulse --format=jpeg
 *
 * Validates the file is a real image (via sharp, not extension alone), strips EXIF,
 * caps max dimension, re-encodes to WebP by default (JPEG/PNG fallback), and writes
 * into public/images/projects/<slug>.<ext>.
 *
 * Then set image_url in content/projects/<slug>.json to e.g. "/images/projects/dbspulse.webp".
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { ROOT } from "./site-url.mjs";

const MAX_EDGE = 2000;
const MAX_BYTES = 12 * 1024 * 1024; // generous raw-input ceiling before processing
const WEBP_QUALITY = 82;
const JPEG_QUALITY = 85;
const DEFAULT_OUT_DIR = path.join(ROOT, "public", "images", "projects");

const ALLOWED_FORMATS = new Set(["webp", "jpeg", "jpg", "png"]);

function printUsage() {
  console.error(`Usage: node scripts/optimize-image.mjs <path-to-raw-image> <project-slug> [--format=webp|jpeg|png] [--out-dir=<dir>]

Examples:
  node scripts/optimize-image.mjs ./raw/hero.jpg dbspulse
  node scripts/optimize-image.mjs ./raw/shot.png dbsai --format=jpeg

Output defaults to public/images/projects/<slug>.webp
Reference it from content/projects/<slug>.json as image_url: "/images/projects/<slug>.webp"`);
}

function parseArgs(argv) {
  const positional = [];
  const flags = { format: "webp", outDir: DEFAULT_OUT_DIR };

  for (const arg of argv) {
    if (arg.startsWith("--format=")) {
      flags.format = arg.slice("--format=".length).toLowerCase();
    } else if (arg.startsWith("--out-dir=")) {
      flags.outDir = path.resolve(arg.slice("--out-dir=".length));
    } else if (arg === "--help" || arg === "-h") {
      flags.help = true;
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown flag: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}

function normalizeFormat(format) {
  if (format === "jpg") return "jpeg";
  if (!ALLOWED_FORMATS.has(format)) {
    throw new Error(`Unsupported --format=${format} (use webp, jpeg, or png)`);
  }
  return format;
}

function extensionFor(format) {
  return format === "jpeg" ? "jpg" : format;
}

function assertSlug(slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      `Invalid project-slug "${slug}" — use lowercase kebab-case matching content/projects/<slug>.json`
    );
  }
}

function report(inputPath, meta, outPath, format) {
  const outStat = fs.statSync(outPath);
  const publicRel = path.relative(path.join(ROOT, "public"), outPath).split(path.sep).join("/");
  const imageUrl = publicRel.startsWith("..") ? outPath : `/${publicRel}`;

  console.log(`optimize-image OK`);
  console.log(`  input:  ${inputPath} (${meta.width}×${meta.height}, ${meta.format})`);
  console.log(`  output: ${outPath} (${outStat.size} bytes, ${format})`);
  console.log(`  image_url: "${imageUrl}"`);
  return { outPath, imageUrl, format, bytes: outStat.size };
}

/**
 * @param {string} inputPath
 * @param {string} slug
 * @param {{ format?: string, outDir?: string }} [opts]
 */
export async function processImage(inputPath, slug, opts = {}) {
  const format = opts.format ?? "webp";
  const outDir = opts.outDir ?? DEFAULT_OUT_DIR;

  assertSlug(slug);
  const resolvedInput = path.resolve(inputPath);

  if (!fs.existsSync(resolvedInput) || !fs.statSync(resolvedInput).isFile()) {
    throw new Error(`Input file not found: ${resolvedInput}`);
  }

  const size = fs.statSync(resolvedInput).size;
  if (size > MAX_BYTES) {
    throw new Error(`Input exceeds ${MAX_BYTES} bytes (${size} bytes) — shrink the source first`);
  }

  // sharp fails if the buffer is not a real image — do not trust extension alone.
  let meta;
  try {
    meta = await sharp(resolvedInput, { failOn: "error" }).metadata();
  } catch (err) {
    throw new Error(
      `Not a valid image (or unreadable): ${resolvedInput} — ${err instanceof Error ? err.message : err}`,
      { cause: err }
    );
  }

  if (!meta.format || meta.format === "svg" || meta.format === "pdf") {
    throw new Error(
      `Unsupported or non-raster image type "${meta.format ?? "unknown"}" — use JPEG, PNG, WebP, GIF, TIFF, or AVIF`
    );
  }

  const targetFormat = normalizeFormat(format);
  fs.mkdirSync(outDir, { recursive: true });

  const outName = `${slug}.${extensionFor(targetFormat)}`;
  const outPath = path.join(outDir, outName);

  // .rotate() applies EXIF orientation; sharp strips metadata on encode by default.
  const base = () =>
    sharp(resolvedInput, { failOn: "error" }).rotate().resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    });

  try {
    if (targetFormat === "webp") {
      await base().webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(outPath);
    } else if (targetFormat === "jpeg") {
      await base()
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toFile(outPath);
    } else {
      await base().png({ compressionLevel: 8 }).toFile(outPath);
    }
  } catch (err) {
    if (targetFormat === "webp") {
      const fallbackPath = path.join(outDir, `${slug}.jpg`);
      console.warn(
        `WebP encode failed (${err instanceof Error ? err.message : err}); falling back to JPEG.`
      );
      await base()
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toFile(fallbackPath);
      return report(resolvedInput, meta, fallbackPath, "jpeg");
    }
    throw err;
  }

  return report(resolvedInput, meta, outPath, targetFormat);
}

export { DEFAULT_OUT_DIR, MAX_EDGE };

async function main() {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    printUsage();
    process.exit(1);
  }

  if (parsed.flags.help || parsed.positional.length < 2) {
    printUsage();
    process.exit(parsed.flags.help ? 0 : 1);
  }

  const [inputPath, slug] = parsed.positional;
  try {
    await processImage(inputPath, slug, parsed.flags);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

const isDirectRun =
  Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
