/**
 * Single source of truth for service-worker caching behavior.
 * Consumed by vite.config.ts (VitePWA) and scripts/generate-sw.mjs (post-prerender regenerate).
 * Do not duplicate runtimeCaching / globPatterns elsewhere — edit this file only.
 */
export const workboxGlobPatterns = [
  "**/*.{js,css,html,ico,png,svg,webp,woff,woff2,jpg,jpeg,webmanifest}",
];

/** Ignored during VitePWA's mid-build generateSW (before prerender). */
export const workboxViteGlobIgnores = ["**/server/**", "**/admin/**", "**/*.php"];

/** Ignored during post-prerender regenerate (also skip previous SW bundles). */
export const workboxPostPrerenderGlobIgnores = [
  "**/server/**",
  "**/admin/**",
  "**/sw.js",
  "**/workbox-*.js",
  "**/*.php",
];

export const workboxNavigateFallback = "/offline.html";
export const workboxNavigateFallbackDenylist = [/^\/admin(?:\/|$)/i, /\.php$/i];

export const workboxRuntimeCaching = [
  {
    // Project screenshots / OG / studio photos change infrequently.
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
    // Light NetworkFirst for misc same-origin docs that may update
    // between deploys (sitemap/robots) without fighting HTML precache.
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
];
