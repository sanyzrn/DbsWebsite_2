/**
 * Deployment promotion gate — hits the live origin over the network.
 *
 * Verifies (host-agnostic; works for Vercel, Nginx, Netlify, Cloudflare Pages, …):
 *  1) SITE_URL / DEPLOY_CHECK_BASE_URL resolves over HTTPS
 *  2) An unknown path returns HTTP 404
 *  3) That 404 body includes robots noindex
 *
 * Usage:
 *   SITE_URL=https://saeedzarrini.ir npm run check:deploy
 *   DEPLOY_CHECK_BASE_URL=https://dbs-website-2.vercel.app npm run check:deploy
 *
 * Prefer DEPLOY_CHECK_BASE_URL when checking a preview host while SITE_URL is the
 * canonical production origin. Does not require any host-specific CLI.
 */
import { getSiteUrl } from "./site-url.mjs";

const base = String(process.env.DEPLOY_CHECK_BASE_URL || getSiteUrl())
  .trim()
  .replace(/\/+$/, "");

if (!/^https:\/\//i.test(base)) {
  console.error(`check:deploy requires an https:// origin, got: ${base}`);
  process.exit(1);
}

const unknownFa = `${base}/__deploy-check-missing-${Date.now()}__`;
const unknownEn = `${base}/en/__deploy-check-missing-${Date.now()}__`;

async function fetchText(url, init) {
  const res = await fetch(url, {
    redirect: "manual",
    headers: { "user-agent": "dbswebsite-check-deploy/1.0" },
    ...init,
  });
  const text = await res.text().catch(() => "");
  return { res, text };
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

async function main() {
  // 1) Canonical / check origin must resolve over HTTPS
  const home = await fetchText(base + "/");
  assert(
    home.res.status >= 200 && home.res.status < 400,
    `SITE_URL origin did not resolve successfully: ${base}/ → HTTP ${home.res.status}`
  );
  console.log(`✓ HTTPS origin reachable: ${base}/ (${home.res.status})`);

  // 2 + 3) Unknown paths → real 404 + noindex in body
  for (const [label, url] of [
    ["fa", unknownFa],
    ["en", unknownEn],
  ]) {
    const { res, text } = await fetchText(url);
    assert(res.status === 404, `${label} unknown path expected HTTP 404, got ${res.status} for ${url}`);
    assert(
      /noindex/i.test(text),
      `${label} 404 response for ${url} is missing robots noindex in the HTML body`
    );
    console.log(`✓ ${label} unknown path → 404 + noindex (${url})`);
  }

  console.log(`check:deploy OK — ${base}`);
}

main().catch((err) => {
  console.error(`check:deploy FAILED: ${err.message || err}`);
  process.exit(1);
});
