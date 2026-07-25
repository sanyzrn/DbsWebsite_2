/**
 * Service-worker template — injected by workbox-build (injectManifest) after prerender
 * so every locale/route HTML is included in the precache manifest.
 *
 * Navigation strategy:
 *  - Known prerendered routes: served from precache (cache-first via precacheAndRoute).
 *  - Unknown routes when ONLINE: network request passes through; server returns the
 *    locale 404 page (Apache/.htaccess handles this).  The SW falls back to the cached
 *    locale 404.html if the network fails.
 *  - Unknown routes when OFFLINE: serve cached offline.html.
 *
 * This avoids the previous bug where navigateFallback='/offline.html' caused online
 * users landing on a non-existent URL to see the offline page instead of a real 404.
 */
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, NetworkOnly } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// Workbox injects the precache manifest here at build time.
// All prerendered HTML (every locale/route) is included after running
// scripts/generate-sw.mjs post-prerender.
precacheAndRoute(self.__WB_MANIFEST);

// Project screenshots / OG / studio photos — long-lived cache-first.
registerRoute(
  ({ request, url }) =>
    request.destination === "image" ||
    /\.(?:png|jpe?g|gif|svg|webp|avif)$/i.test(url.pathname),
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Sitemap / robots — network-first, 24h TTL.
registerRoute(
  ({ url, sameOrigin }) =>
    sameOrigin && /\.(?:xml|txt)$/i.test(url.pathname) && !url.pathname.endsWith(".php"),
  new NetworkFirst({
    cacheName: "seo-files",
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({ maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

/**
 * Navigation handler: try the network first (so online unknown routes let
 * the server's 404 logic run), then fall back to cached locale 404.html when
 * the network fails, and to offline.html when the device is truly offline.
 */
const navHandler = new NetworkOnly();
registerRoute(
  new NavigationRoute(
    async (params) => {
      try {
        return await navHandler.handle(params);
      } catch {
        if (!navigator.onLine) {
          const offline = await caches.match("/offline.html");
          if (offline) return offline;
        }
        // Network error while online → serve cached locale 404 page.
        const pathname = new URL(params.request.url).pathname;
        const notFoundUrl = pathname.startsWith("/en") ? "/en/404.html" : "/404.html";
        const cached404 = await caches.match(notFoundUrl);
        if (cached404) return cached404;
        // Last resort: offline page or a bare 404 response.
        const offlineFallback = await caches.match("/offline.html");
        return offlineFallback ?? new Response("Not Found", { status: 404 });
      }
    },
    { denylist: [/^\/admin(?:\/|$)/i, /\.php$/i] }
  )
);
