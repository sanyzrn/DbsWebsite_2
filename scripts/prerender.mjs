/**
 * After `vite build` + SSR bundle, visit every route and emit static HTML into dist/.
 * Output remains a backend-free static site (no runtime server).
 *
 * Also collects inline script / style hashes and writes a tightened CSP into
 * hosting configs + dist/.htaccess (see scripts/csp.mjs).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  applyNonceToHtml,
  buildCspHeader,
  collectStyleAttributeHashes,
  createBuildNonce,
  sha256Integrity,
  walkHtmlFiles,
  writeCspToHostingConfigs,
} from "./csp.mjs";
import { serializeJsonLd } from "./jsonld-serialize.mjs";
import { ROOT, getSiteUrl } from "./site-url.mjs";

const dist = path.join(ROOT, "dist");
const serverEntry = path.join(dist, "server", "entry-server.js");
const templatePath = path.join(dist, "index.html");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildHeadTags(seo, { nonce } = {}) {
  const ogType =
    (seo.path.includes("/projects/") && !seo.path.endsWith("/projects")) ||
    (seo.path.includes("/articles/") && !seo.path.endsWith("/articles"))
      ? "article"
      : "website";
  const jsonLd = seo.jsonLd.map((block) => serializeJsonLd(block)).join("\n");
  const robots =
    typeof seo.robots === "string" && seo.robots.trim()
      ? `\n    <meta name="robots" content="${escapeHtml(seo.robots)}" />`
      : "";
  const nonceAttr = nonce ? ` nonce="${escapeHtml(nonce)}"` : "";
  return `
    <title>${escapeHtml(seo.title)}</title>
    <meta name="description" content="${escapeHtml(seo.description)}" />${robots}
    <link rel="canonical" href="${escapeHtml(seo.canonical)}" />
    <link rel="alternate" hreflang="fa" href="${escapeHtml(seo.alternateFa)}" />
    <link rel="alternate" hreflang="en" href="${escapeHtml(seo.alternateEn)}" />
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(seo.alternateEn)}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:locale" content="${escapeHtml(seo.ogLocale)}" />
    <meta property="og:locale:alternate" content="${escapeHtml(seo.ogLocaleAlternate)}" />
    <meta property="og:site_name" content="Saeed Zarrini" />
    <meta property="og:title" content="${escapeHtml(seo.title)}" />
    <meta property="og:description" content="${escapeHtml(seo.description)}" />
    <meta property="og:url" content="${escapeHtml(seo.canonical)}" />
    <meta property="og:image" content="${escapeHtml(seo.image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(seo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(seo.description)}" />
    <meta name="twitter:image" content="${escapeHtml(seo.image)}" />
    <script type="application/ld+json"${nonceAttr}>${jsonLd}</script>
  `.trim();
}

function stripManagedHead(html) {
  return html
    .replace(/<title>[^]*?<\/title>/i, "")
    .replace(/<meta\s+name="description"[^>]*>/i, "")
    .replace(/<meta\s+name="robots"[^>]*>/gi, "")
    .replace(/<meta\s+name="csp-nonce"[^>]*>/gi, "")
    .replace(/<meta\s+http-equiv="Content-Security-Policy"[^>]*>/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>/i, "")
    .replace(/<link\s+rel="alternate"[^>]*>/gi, "")
    .replace(/<meta\s+property="og:[^"]+"[^>]*>/gi, "")
    .replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi, "")
    .replace(/<script\s+type="application\/ld\+json"[^>]*>[^]*?<\/script>/gi, "");
}

function injectHtml(template, { html, seo, lang }, nonce) {
  const dir = lang === "en" ? "ltr" : "rtl";
  let out = stripManagedHead(template);
  out = out.replace(/<html[^>]*>/i, `<html lang="${lang}" dir="${dir}">`);
  out = out.replace(/<\/head>/i, `${buildHeadTags(seo, { nonce })}\n  </head>`);
  out = out.replace(
    /<div id="root"><\/div>|<div id="root">[\s\S]*?<\/div>/i,
    `<div id="root">${html}</div>`
  );
  out = applyNonceToHtml(out, nonce);
  return out;
}

function outFileForPath(urlPath) {
  if (urlPath === "/") return path.join(dist, "index.html");
  if (urlPath === "/404") return path.join(dist, "404.html");
  if (urlPath === "/en/404") return path.join(dist, "en", "404.html");
  const clean = urlPath.replace(/\/+$/, "");
  return path.join(dist, clean.slice(1), "index.html");
}

/** Extract raw text content of inline scripts (no src). */
function collectInlineScriptBodies(html) {
  const bodies = [];
  const re = /<script(?![^>]*\bsrc=)([^>]*)>([^]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    bodies.push(m[2]);
  }
  return bodies;
}

function writeDistHtaccess(cspHeader) {
  const example = path.join(ROOT, "hosting", "apache.htaccess.example");
  if (!fs.existsSync(example)) return;
  let text = fs.readFileSync(example, "utf8");
  text = text.replace(
    /Header set Content-Security-Policy "[^"]*"/,
    `Header set Content-Security-Policy "${cspHeader}"`
  );
  fs.writeFileSync(path.join(dist, ".htaccess"), text, "utf8");
}

async function main() {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Missing ${templatePath} — run vite build first`);
  }
  if (!fs.existsSync(serverEntry)) {
    throw new Error(`Missing ${serverEntry} — run vite SSR build first`);
  }

  process.env.SITE_URL = process.env.SITE_URL || getSiteUrl();

  const nonce = createBuildNonce();
  const mod = await import(pathToFileURL(serverEntry).href);
  const { render, listPrerenderPaths } = mod;
  const template = fs.readFileSync(templatePath, "utf8");
  const paths = listPrerenderPaths();

  const scriptBodies = new Set();
  const styleHashes = new Set();

  for (const urlPath of paths) {
    const result = render(urlPath);
    const file = outFileForPath(urlPath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const page = injectHtml(template, result, nonce);
    fs.writeFileSync(file, page, "utf8");

    for (const body of collectInlineScriptBodies(page)) {
      scriptBodies.add(body);
    }
    for (const h of collectStyleAttributeHashes(page)) {
      styleHashes.add(h);
    }
    console.log(`prerender ${urlPath} → ${path.relative(ROOT, file)}`);
  }

  // Prefer nonce for scripts (JSON-LD varies per page; SPA PageMeta reinjects with same nonce).
  // Still record hashes for diagnostics.
  const scriptHashes = [...scriptBodies].map((b) => sha256Integrity(b));
  const styleHashList = [...styleHashes];
  const cspHeader = buildCspHeader({ nonce, styleHashes: styleHashList });
  const cspMeta = buildCspHeader({ nonce, styleHashes: styleHashList, forMeta: true });

  // Meta CSP on every page so hosts that ignore mid-build vercel.json still enforce policy.
  // Omit frame-ancestors here — that directive is header-only and warns in <meta>.
  for (const file of walkHtmlFiles(dist)) {
    let html = fs.readFileSync(file, "utf8");
    if (/http-equiv="Content-Security-Policy"/i.test(html)) continue;
    const meta = `    <meta http-equiv="Content-Security-Policy" content="${escapeHtml(cspMeta)}" />\n`;
    html = html.replace(/<\/head>/i, `${meta}  </head>`);
    fs.writeFileSync(file, html, "utf8");
  }

  writeCspToHostingConfigs(cspHeader);
  writeDistHtaccess(cspHeader);

  fs.writeFileSync(
    path.join(dist, "csp-build.json"),
    JSON.stringify(
      {
        nonce,
        scriptHashCount: scriptHashes.length,
        styleHashCount: styleHashes.size,
        cspHeader,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  // Drop the SSR bundle — deploy stays static-only.
  fs.rmSync(path.join(dist, "server"), { recursive: true, force: true });
  console.log(
    `Prerendered ${paths.length} routes (SITE_URL=${getSiteUrl()}); CSP nonce + ${styleHashes.size} style hash(es), ${scriptHashes.length} inline script body(ies)`
  );
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
