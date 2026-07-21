import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertOgImageDimensions,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
} from "../../scripts/og-image.mjs";
import { ROOT } from "../../scripts/site-url.mjs";

const tmpDirs = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("assertOgImageDimensions", () => {
  it("accepts a JPEG that is exactly 1200×630", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "og-ok-"));
    tmpDirs.push(dir);
    const file = path.join(dir, "og.jpg");
    await sharp({
      create: {
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        channels: 3,
        background: { r: 20, g: 20, b: 20 },
      },
    })
      .jpeg()
      .toFile(file);

    await expect(assertOgImageDimensions(file, "og.jpg")).resolves.toMatchObject({
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
    });
  });

  it("fails when the file is missing", async () => {
    await expect(assertOgImageDimensions("/tmp/does-not-exist-og.jpg", "missing")).rejects.toThrow(
      /missing Open Graph image/
    );
  });

  it("fails when dimensions are not 1200×630", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "og-bad-"));
    tmpDirs.push(dir);
    const file = path.join(dir, "og.jpg");
    await sharp({
      create: {
        width: 614,
        height: 614,
        channels: 3,
        background: { r: 20, g: 20, b: 20 },
      },
    })
      .jpeg()
      .toFile(file);

    await expect(assertOgImageDimensions(file, "og.jpg")).rejects.toThrow(/1200×630/);
  });

  it("repo public/og.jpg is exactly 1200×630 (source of truth)", async () => {
    const file = path.join(ROOT, "public", "og.jpg");
    const meta = await assertOgImageDimensions(file, "public/og.jpg");
    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(630);
  });
});
