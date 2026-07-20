import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import sharp from "sharp";
import { MAX_EDGE, processImage } from "../../scripts/optimize-image.mjs";

const tmpDirs = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

async function writePng(dir, name, width, height) {
  const file = path.join(dir, name);
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 40, g: 120, b: 200 },
    },
  })
    .png()
    .toFile(file);
  return file;
}

describe("optimize-image", () => {
  it("rejects non-image files even with an image extension", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "opt-img-"));
    tmpDirs.push(dir);
    const fake = path.join(dir, "not-an-image.png");
    fs.writeFileSync(fake, "definitely not an image");
    await expect(processImage(fake, "dbspulse", { outDir: dir })).rejects.toThrow(/valid image/i);
  });

  it("writes a capped WebP and reports a site-relative image_url when under public/", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "opt-img-"));
    tmpDirs.push(root);
    const input = await writePng(root, "raw.png", 2400, 1600);
    // Mirror public/images/projects layout so image_url is site-relative.
    const outDir = path.join(root, "public", "images", "projects");
    // processImage uses ROOT from site-url for image_url — use absolute outDir and
    // assert file properties; image_url may be absolute when outDir is outside repo public/.
    const result = await processImage(input, "dbspulse", { outDir, format: "webp" });
    expect(fs.existsSync(result.outPath)).toBe(true);
    expect(result.outPath.endsWith("dbspulse.webp")).toBe(true);
    expect(result.format).toBe("webp");

    const meta = await sharp(result.outPath).metadata();
    expect(meta.format).toBe("webp");
    expect(Math.max(meta.width ?? 0, meta.height ?? 0)).toBeLessThanOrEqual(MAX_EDGE);
    // EXIF / orientation metadata should not be carried over after re-encode.
    expect(meta.exif).toBeUndefined();
  });

  it("rejects invalid project slugs", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "opt-img-"));
    tmpDirs.push(dir);
    const input = await writePng(dir, "raw.png", 100, 100);
    await expect(processImage(input, "Bad_Slug", { outDir: dir })).rejects.toThrow(/slug/i);
  });
});
