/**
 * Post-build checks for prerendered dist/:
 *  1) Every internal href resolves to an existing file under dist/
 *  2) Every canonical / og:url matches the SITE_URL used for the build
 *  3) Open Graph image (public/og.jpg + dist/og.jpg) is exactly 1200×630
 *
 * Extends the pre-build host checks in check-urls.mjs (source files).
 * Usage: node scripts/check-dist.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, getSiteUrl, getSiteHost } from "./site-url.mjs";
import {
  assertOgImageDimensions,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
} from "./og-image.mjs";

const siteUrl = getSiteUrl();
const siteHost = getSiteHost(siteUrl);
const siteOrigin = siteUrl.replace(/\/+$/, "");
const DIST = path.join(ROOT, "dist");

if (!fs.existsSync(DIST)) {
  throw new Error("dist/ missing — run `npm run build` before check:dist");
}

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "server" || entry.name === "assets") continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(abs, out);
    else if (entry.name.endsWith(".html")) out.push(abs);
  }
  return out;
}

/** Map a site pathname to a candidate file under dist/. */
function resolveInternalPath(pathname) {
  let p = pathname.split("#")[0].split("?")[0];
  if (!p || p === "/") return path.join(DIST, "index.html");
  p = p.replace(/\/+$/, "");
  const candidates = [
    path.join(DIST, p + ".html"),
    path.join(DIST, p, "index.html"),
    path.join(DIST, p),
  ];
  // Locale 404s are emitted as dist/404.html and dist/en/404.html
  if (p === "/404" || p === "/en/404") {
    candidates.unshift(path.join(DIST, p.slice(1) + ".html"));
  }
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
}

function isInternalHref(href) {
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
    return false;
  }
  if (href.startsWith("#")) return false; // same-page anchors
  if (href.startsWith("//")) return false;
  if (/^https?:\/\//i.test(href)) {
    try {
      return new URL(href).host === siteHost;
    } catch {
      return false;
    }
  }
  // Relative / root-relative app links
  return href.startsWith("/") || !href.includes(":");
}

function toPathname(href, fromFile) {
  if (/^https?:\/\//i.test(href)) {
    return new URL(href).pathname;
  }
  if (href.startsWith("/")) return href;
  // Relative to the HTML file's URL path
  const relDir = path.relative(DIST, path.dirname(fromFile)).split(path.sep).join("/");
  const basePath = relDir ? `/${relDir}/` : "/";
  return new URL(href, `https://example.local${basePath}`).pathname;
}

const HREF_RE = /(?:href|src)=["']([^"']+)["']/gi;
const CANONICAL_RE = /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
const CANONICAL_RE_ALT = /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/gi;
const OG_URL_RE = /<meta[^>]+property=["']og:url["'][^>]*content=["']([^"']+)["'][^>]*>/gi;
const OG_URL_RE_ALT = /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:url["'][^>]*>/gi;

const htmlFiles = walkHtml(DIST);
if (!htmlFiles.length) {
  throw new Error("No HTML files found under dist/");
}

const broken = [];
const badCanonical = [];

for (const file of htmlFiles) {
  const text = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file);

  let m;
  HREF_RE.lastIndex = 0;
  while ((m = HREF_RE.exec(text)) !== null) {
    const href = m[1].trim();
    if (!isInternalHref(href)) continue;
    // Asset URLs under /assets/ must exist as files
    if (href.startsWith("/assets/") || href.includes("/assets/")) {
      const assetPath = href.startsWith("http")
        ? new URL(href).pathname
        : href.startsWith("/")
          ? href
          : toPathname(href, file);
      const assetFile = path.join(DIST, assetPath.replace(/^\//, ""));
      if (!fs.existsSync(assetFile)) {
        broken.push(`${rel}: missing asset ${href}`);
      }
      continue;
    }
    // Skip binary / public static that may live beside HTML
    if (/\.(svg|png|jpe?g|webp|ico|txt|xml|woff2?|css|js)$/i.test(href.split("?")[0])) {
      const staticPath = href.startsWith("/")
        ? path.join(DIST, href.slice(1).split("?")[0])
        : path.join(path.dirname(file), href.split("?")[0]);
      if (!fs.existsSync(staticPath)) {
        // Also try public-copied root files
        const rootTry = path.join(DIST, path.basename(href.split("?")[0]));
        if (!fs.existsSync(rootTry)) {
          broken.push(`${rel}: missing static ${href}`);
        }
      }
      continue;
    }
    const pathname = toPathname(href, file);
    if (!resolveInternalPath(pathname)) {
      broken.push(`${rel}: broken internal link ${href} → ${pathname}`);
    }
  }

  const seoUrls = [];
  for (const re of [CANONICAL_RE, CANONICAL_RE_ALT, OG_URL_RE, OG_URL_RE_ALT]) {
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) seoUrls.push(m[1]);
  }
  for (const url of seoUrls) {
    if (!url.startsWith(siteOrigin + "/") && url !== siteOrigin) {
      badCanonical.push(`${rel}: canonical/og:url ${url} does not match SITE_URL ${siteOrigin}`);
    }
  }
}

if (broken.length || badCanonical.length) {
  const lines = [...broken, ...badCanonical];
  throw new Error(`check:dist failed (${lines.length} issue(s)):\n` + lines.slice(0, 40).join("\n"));
}

// Host-independent: prerendered 404 documents must carry robots noindex
for (const rel of ["404.html", "en/404.html"]) {
  const abs = path.join(DIST, rel);
  if (!fs.existsSync(abs)) {
    throw new Error(`check:dist missing ${rel}`);
  }
  const html = fs.readFileSync(abs, "utf8");
  if (!/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
    throw new Error(`check:dist ${rel} is missing <meta name="robots" content="noindex…">`);
  }
}

// Open Graph / Twitter Card image — must stay exactly 1200×630 (LinkedIn / X / Telegram)
await assertOgImageDimensions(path.join(ROOT, "public", "og.jpg"), "public/og.jpg");
await assertOgImageDimensions(path.join(DIST, "og.jpg"), "dist/og.jpg");

console.log(
  `check:dist OK — ${htmlFiles.length} HTML files, internal links + canonical/og:url match SITE_URL=${siteUrl}, ` +
    `404 pages noindex, og.jpg ${OG_IMAGE_WIDTH}×${OG_IMAGE_HEIGHT}`
);
