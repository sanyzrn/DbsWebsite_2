/**
 * Open Graph / Twitter Card image dimensions (LinkedIn / X / Telegram).
 * Shared by check-dist.mjs and tests — keep public/og.jpg exactly this size.
 */
import fs from "node:fs";
import sharp from "sharp";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/**
 * Assert an on-disk image is present and exactly 1200×630.
 * @param {string} absPath
 * @param {string} [label]
 */
export async function assertOgImageDimensions(absPath, label = absPath) {
  if (!fs.existsSync(absPath)) {
    throw new Error(`check:dist missing Open Graph image ${label}`);
  }
  const meta = await sharp(absPath).metadata();
  if (meta.width !== OG_IMAGE_WIDTH || meta.height !== OG_IMAGE_HEIGHT) {
    throw new Error(
      `check:dist ${label} must be exactly ${OG_IMAGE_WIDTH}×${OG_IMAGE_HEIGHT} ` +
        `(got ${meta.width ?? "?"}×${meta.height ?? "?"}) — regenerate public/og.jpg`
    );
  }
  return meta;
}
