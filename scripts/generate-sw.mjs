/**
 * Regenerate Workbox generateSW *after* prerender so every locale/route HTML
 * in dist/ is revisioned into the precache (vite-plugin-pwa runs during
 * `vite build`, which is before scripts/prerender.mjs emits route HTML).
 *
 * Keeps the same runtime strategies as vite.config.ts VitePWA({ workbox }).
 * Manifest is still emitted by vite-plugin-pwa during the client build.
 *
 * Usage: node scripts/generate-sw.mjs   (invoked at end of `npm run build`)
 */
import fs from "node:fs";
import path from "node:path";
import { generateSW } from "workbox-build";
import { ROOT } from "./site-url.mjs";

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
  globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2,jpg,jpeg,webmanifest}"],
  globIgnores: ["**/server/**", "**/admin/**", "**/sw.js", "**/workbox-*.js"],
  swDest: path.join(DIST, "sw.js"),
  // Uncached navigations → on-brand offline page; never claim PHP/admin.
  navigateFallback: "/offline.html",
  navigateFallbackDenylist: [/^\/admin(?:\/|$)/i, /\.php$/i],
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: true,
  // Default revisioning stays ON — bilingual HTML invalidates per build hash.
  runtimeCaching: [
    {
      urlPattern: ({ request, url }) =>
        request.destination === "image" ||
        /\.(?:png|jpe?g|gif|svg|webp|avif)$/i.test(url.pathname),
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 80,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: ({ url, sameOrigin }) =>
        sameOrigin && /\.(?:xml|txt)$/i.test(url.pathname) && !url.pathname.endsWith(".php"),
      handler: "NetworkFirst",
      options: {
        cacheName: "seo-files",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 8,
          maxAgeSeconds: 60 * 60 * 24,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
});

if (warnings?.length) {
  for (const w of warnings) console.warn("workbox:", w);
}

const kib = (size / 1024).toFixed(1);
console.log(`generate-sw OK — precached ${count} entries (${kib} KiB) into dist/sw.js`);
