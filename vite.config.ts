/// <reference types="vitest/config" />
import path from "path";
import { fileURLToPath } from "url";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { toString as mdastToString } from "mdast-util-to-string";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Inject frontmatter.readingTimeMinutes from MDX body word count (~200 wpm). */
function remarkArticleReadingTime() {
  return (tree: unknown, file: { data?: Record<string, unknown> }) => {
    const words = mdastToString(tree as never)
      .split(/\s+/)
      .filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    const data = (file.data ??= {});
    const matter = (data.matter as Record<string, unknown> | undefined) ?? {};
    matter.readingTimeMinutes = minutes;
    data.matter = matter;
  };
}

const DEFAULT_SITE_URL = "https://saeedzarrini.ir";

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
export default defineConfig(async ({ mode, isSsrBuild }) => {
  // Shared SW caching — single source of truth with scripts/generate-sw.mjs
  const {
    workboxGlobPatterns,
    workboxNavigateFallback,
    workboxNavigateFallbackDenylist,
    workboxRuntimeCaching,
    workboxViteGlobIgnores,
  } = await import("./scripts/workbox-shared-config.mjs");

  const env = loadEnv(mode, __dirname, "");
  const siteUrl = normalizeSiteUrl(env.SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL);

  return {
    plugins: [
      // MDX must run before the React plugin (pre) so .mdx compiles to JSX first.
      {
        enforce: "pre" as const,
        ...mdx({
          remarkPlugins: [remarkFrontmatter, remarkArticleReadingTime, remarkMdxFrontmatter],
        }),
      },
      react({ include: /\.(jsx|js|tsx|ts|mdx)$/ }),
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
            // Shared with scripts/generate-sw.mjs via scripts/workbox-shared-config.mjs.
            globPatterns: workboxGlobPatterns,
            globIgnores: workboxViteGlobIgnores,
            navigateFallback: workboxNavigateFallback,
            navigateFallbackDenylist: workboxNavigateFallbackDenylist,
            cleanupOutdatedCaches: true,
            clientsClaim: true,
            skipWaiting: true,
            runtimeCaching: workboxRuntimeCaching,
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
