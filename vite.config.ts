/// <reference types="vitest/config" />
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_SITE_URL = "https://dbsgraphic.ir";

/** Light-theme tokens from src/index.css — keep in sync with <meta name="theme-color">. */
const PWA_BG = "#f5f0e8"; // --page
const PWA_THEME = "#bc9463"; // --accent

/** English SEO description (manifest is single-locale; fa lives in the HTML head). */
const PWA_DESCRIPTION =
  "For founders and teams stuck between idea and shipping: I design, engineer, and integrate AI into digital products that actually work.";

function normalizeSiteUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error(`SITE_URL must be an absolute http(s) URL, got: ${raw}`);
  }
  return trimmed;
}

function siteUrlHtmlPlugin(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/+$/, "");
  return {
    name: "site-url-html",
    transformIndexHtml(html) {
      return html.split("__SITE_URL__").join(base);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, __dirname, "");
  const siteUrl = normalizeSiteUrl(env.SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL);

  return {
    plugins: [
      react(),
      tailwindcss(),
      siteUrlHtmlPlugin(siteUrl),
      // Client build only — SSR pass must not emit a second service worker.
      !isSsrBuild &&
        VitePWA({
          // Workbox generateSW — static prerendered site; no injectManifest needed.
          strategies: "generateSW",
          registerType: "autoUpdate",
          injectRegister: false, // registered explicitly in src/main.tsx (prod only)
          includeAssets: [
            "favicon.svg",
            "offline.html",
            "icons/pwa-192x192.png",
            "icons/pwa-512x512.png",
            "icons/pwa-512x512-maskable.png",
            "apple-touch-icon.png",
            "Dbs_logo_single.webp",
            "og.jpg",
          ],
          manifest: {
            name: "Saeed Zarrini — AI Solutions Engineer & Digital Product Builder",
            short_name: "Saeed Zarrini",
            description: PWA_DESCRIPTION,
            // Locale redirect after launch is handled by LocalePreferenceRedirect.
            start_url: "/",
            scope: "/",
            display: "standalone",
            orientation: "portrait-primary",
            background_color: PWA_BG,
            theme_color: PWA_THEME,
            lang: "en",
            dir: "ltr",
            icons: [
              {
                src: "icons/pwa-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
              },
              {
                src: "icons/pwa-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
              },
              {
                src: "icons/pwa-512x512-maskable.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
              },
            ],
          },
          workbox: {
            // Precache build output (HTML/CSS/JS/fonts/icons). Revision hashes stay ON
            // (default) so locale HTML and assets invalidate correctly across builds.
            globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2,jpg,jpeg,webmanifest}"],
            globIgnores: ["**/server/**", "**/admin/**", "**/*.php"],
            // Uncached navigations (offline + miss) → on-brand offline page.
            // Never claim PHP/admin routes for the public static PWA.
            navigateFallback: "/offline.html",
            navigateFallbackDenylist: [/^\/admin(?:\/|$)/i, /\.php$/i],
            cleanupOutdatedCaches: true,
            clientsClaim: true,
            skipWaiting: true,
            runtimeCaching: [
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
            ],
          },
          devOptions: {
            enabled: false,
          },
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    define: {
      "import.meta.env.VITE_SITE_URL": JSON.stringify(siteUrl),
    },
    build: {
      // Multi-page static emit (CSS/JS assets + prerendered HTML per route).
      cssCodeSplit: true,
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      css: true,
    },
  };
});
