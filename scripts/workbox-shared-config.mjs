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

/**
 * Assets that ship in dist/ but must not be downloaded up front by every visitor.
 * Precaching is eager — anything listed in the manifest is fetched on the first
 * visit, regardless of whether the page ever asks for it. These stay available
 * over the network (and through runtime caching); they are just not prefetched.
 *
 *  - Fontsource emits one file per unicode-range subset. This site is Persian +
 *    English only, so the Cyrillic / Vietnamese / extended-Latin subsets are never
 *    selected by the browser — precaching them was ~450 KiB of pure waste.
 *  - The MagicDust WebGL chunk is three.js (~230 KiB gzip) behind a runtime gate that
 *    skips it entirely for reduced-motion, low-memory and small-screen devices, and
 *    is loaded on idle even when it does run. Precaching it defeated that gate.
 */
export const workboxUnusedAssetGlobs = [
  "**/assets/*-cyrillic-*.woff2",
  "**/assets/*-vietnamese-*.woff2",
  "**/assets/*-latin-ext-*.woff2",
  "**/assets/magic-dust-shader-*.js",
];

/** Ignored during VitePWA's mid-build generateSW (before prerender). */
export const workboxViteGlobIgnores = [
  "**/server/**",
  "**/admin/**",
  "**/*.php",
  ...workboxUnusedAssetGlobs,
];

/** Ignored during post-prerender injectManifest (also skip previous SW bundles). */
export const workboxPostPrerenderGlobIgnores = [
  "**/server/**",
  "**/admin/**",
  "**/sw.js",
  "**/workbox-*.js",
  "**/*.php",
  ...workboxUnusedAssetGlobs,
];
