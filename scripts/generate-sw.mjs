/**
 * Regenerate the service worker *after* prerender using Workbox injectManifest,
 * so every locale/route HTML in dist/ is revisioned into the precache.
 *
 * VitePWA (generateSW) runs a mid-build SW during `vite build` that does not yet
 * include the prerendered locale HTML.  This script replaces it with a final SW
 * compiled from scripts/sw-template.js (which defines the custom navigation handler
 * and runtime-caching rules) and a full precache manifest that includes all HTML.
 *
 * Usage: node scripts/generate-sw.mjs   (invoked at end of `npm run build`)
 */
import fs from "node:fs";
import path from "node:path";
import { injectManifest } from "workbox-build";
import { ROOT } from "./site-url.mjs";
import {
  workboxGlobPatterns,
  workboxPostPrerenderGlobIgnores,
} from "./workbox-shared-config.mjs";

const DIST = path.join(ROOT, "dist");
const SW_TEMPLATE = path.join(ROOT, "scripts", "sw-template.js");

if (!fs.existsSync(DIST)) {
  throw new Error("dist/ missing — run the Vite client build + prerender first");
}

if (!fs.existsSync(SW_TEMPLATE)) {
  throw new Error("scripts/sw-template.js missing");
}

// Remove previous Workbox bundles so stale hashed files are not left behind.
for (const name of fs.readdirSync(DIST)) {
  if (name === "sw.js" || /^workbox-.*\.js$/.test(name)) {
    fs.unlinkSync(path.join(DIST, name));
  }
}

const { count, size, warnings } = await injectManifest({
  swSrc: SW_TEMPLATE,
  swDest: path.join(DIST, "sw.js"),
  globDirectory: DIST,
  globPatterns: workboxGlobPatterns,
  globIgnores: workboxPostPrerenderGlobIgnores,
  injectionPoint: "self.__WB_MANIFEST",
});

if (warnings?.length) {
  for (const w of warnings) console.warn("workbox:", w);
}

const kib = (size / 1024).toFixed(1);
console.log(`generate-sw OK — precached ${count} entries (${kib} KiB) into dist/sw.js`);
