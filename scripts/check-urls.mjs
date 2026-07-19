/**
 * Fail the build if index.html / public/robots.txt / public/sitemap.xml
 * contain a site-domain host different from SITE_URL.
 *
 * Third-party hosts (fonts, schema.org, social profiles) are allowlisted for index.html.
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, getSiteUrl, getSiteHost } from "./site-url.mjs";

const siteUrl = getSiteUrl();
const siteHost = getSiteHost(siteUrl);

/** Hosts allowed in index.html besides SITE_URL (CDN / schema / social sameAs). */
const INDEX_ALLOWLIST = new Set([
  siteHost,
  "schema.org",
  "github.com",
  "www.linkedin.com",
  "linkedin.com",
]);

/** Hosts allowed in robots.txt / sitemap.xml besides SITE_URL. */
const SEO_FILE_ALLOWLIST = new Set([siteHost, "www.sitemaps.org"]);

const URL_HOST_RE = /https?:\/\/([^/\s"'<>]+)/gi;

function hostsIn(text) {
  const hosts = new Set();
  let m;
  while ((m = URL_HOST_RE.exec(text)) !== null) {
    hosts.add(m[1].toLowerCase());
  }
  return hosts;
}

function assertFile(relPath, { allowlist, requireSiteHost }) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Missing file: ${relPath}`);
  }
  const text = fs.readFileSync(abs, "utf8");
  const hosts = hostsIn(text);
  const bad = [...hosts].filter((h) => !allowlist.has(h));
  if (bad.length) {
    throw new Error(
      `${relPath} contains domain(s) not equal to SITE_URL (${siteHost}): ${bad.join(", ")}\n` +
        `Set SITE_URL and re-run \`npm run generate:seo\` (or fix hardcoded URLs).`
    );
  }
  if (requireSiteHost && !hosts.has(siteHost)) {
    throw new Error(`${relPath} does not reference SITE_URL host (${siteHost}).`);
  }
  if (text.includes("__SITE_URL__")) {
    throw new Error(`${relPath} still contains __SITE_URL__ placeholder — transform did not run.`);
  }
}

assertFile("public/robots.txt", { allowlist: SEO_FILE_ALLOWLIST, requireSiteHost: true });
assertFile("public/sitemap.xml", { allowlist: SEO_FILE_ALLOWLIST, requireSiteHost: true });

// index.html source uses placeholders until Vite transforms; check that no *hardcoded*
// alternate site domains remain (e.g. saeedzarrini.com), and that placeholders or SITE_URL exist.
const indexPath = path.join(ROOT, "index.html");
const indexHtml = fs.readFileSync(indexPath, "utf8");
const indexHosts = hostsIn(indexHtml);
const forbiddenSiteHosts = [...indexHosts].filter(
  (h) => !INDEX_ALLOWLIST.has(h) && h !== siteHost
);
// Also flag known stale portfolio hosts even if somehow allowlisted incorrectly
const stale = ["saeedzarrini.com", "www.saeedzarrini.com"];
for (const h of stale) {
  if (indexHtml.toLowerCase().includes(h)) {
    throw new Error(`index.html still hardcodes stale domain: ${h}`);
  }
}
if (forbiddenSiteHosts.length) {
  throw new Error(
    `index.html contains unexpected domain(s): ${forbiddenSiteHosts.join(", ")} (SITE_URL host is ${siteHost})`
  );
}
if (!indexHtml.includes("__SITE_URL__") && !indexHosts.has(siteHost)) {
  throw new Error(`index.html must use __SITE_URL__ placeholders or absolute SITE_URL (${siteHost}).`);
}

console.log(`check:urls OK — SITE_URL=${siteUrl}`);
