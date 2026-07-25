/**
 * Shared glob patterns for service-worker asset precaching.
 * Consumed by vite.config.ts (VitePWA mid-build SW) and
 * scripts/generate-sw.mjs (post-prerender injectManifest rebuild).
 *
 * Navigation strategy and runtime caching are defined in
 * scripts/sw-template.js (the injectManifest source), which is
 * what powers the final dist/sw.js served to browsers.
 */
export const workboxGlobPatterns = [
  "**/*.{js,css,html,ico,png,svg,webp,woff,woff2,jpg,jpeg,webmanifest}",
];

/** Ignored during VitePWA's mid-build generateSW (before prerender). */
export const workboxViteGlobIgnores = ["**/server/**", "**/admin/**", "**/*.php"];

/** Ignored during post-prerender injectManifest (also skip previous SW bundles). */
export const workboxPostPrerenderGlobIgnores = [
  "**/server/**",
  "**/admin/**",
  "**/sw.js",
  "**/workbox-*.js",
  "**/*.php",
];
