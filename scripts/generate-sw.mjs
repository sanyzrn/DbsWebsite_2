/**
 * Regenerate Workbox generateSW *after* prerender so every locale/route HTML
 * in dist/ is revisioned into the precache (vite-plugin-pwa runs during
 * `vite build`, which is before scripts/prerender.mjs emits route HTML).
 *
 * Caching strategy comes from scripts/workbox-shared-config.mjs (single source of truth).
 * Manifest is still emitted by vite-plugin-pwa during the client build.
 *
 * Usage: node scripts/generate-sw.mjs   (invoked at end of `npm run build`)
 */
import fs from "node:fs";
import path from "node:path";
import { generateSW } from "workbox-build";
import { ROOT } from "./site-url.mjs";
import {
  workboxGlobPatterns,
  workboxNavigateFallback,
  workboxNavigateFallbackDenylist,
  workboxPostPrerenderGlobIgnores,
  workboxRuntimeCaching,
} from "./workbox-shared-config.mjs";

const DIST = path.join(ROOT, "dist");

if (!fs.existsSync(DIST)) {
  throw new Error("dist/ missing — run the Vite client build + prerender first");
}

// Remove previous Workbox bundles so we don't leave stale hashed files behind.
for (const name of fs.readdirSync(DIST)) {
  if (name === "sw.js" || /^workbox-.*\.js$/.test(name)) {
    fs.unlinkSync(path.join(DIST, name));
  }
}

const { count, size, warnings } = await generateSW({
  globDirectory: DIST,
  globPatterns: workboxGlobPatterns,
  globIgnores: workboxPostPrerenderGlobIgnores,
  swDest: path.join(DIST, "sw.js"),
  navigateFallback: workboxNavigateFallback,
  navigateFallbackDenylist: workboxNavigateFallbackDenylist,
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: workboxRuntimeCaching,
});

if (warnings?.length) {
  for (const w of warnings) console.warn("workbox:", w);
}

const kib = (size / 1024).toFixed(1);
console.log(`generate-sw OK — precached ${count} entries (${kib} KiB) into dist/sw.js`);
