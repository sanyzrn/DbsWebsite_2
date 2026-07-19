/**
 * After `vite build` + SSR bundle, visit every route and emit static HTML into dist/.
 * Output remains a backend-free static site (no runtime server).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
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

function buildHeadTags(seo, lang) {
  const ogType = seo.path.includes("/projects/") && !seo.path.endsWith("/projects") ? "article" : "website";
  const jsonLd = seo.jsonLd.map((block) => JSON.stringify(block)).join("\n");
  return `
    <title>${escapeHtml(seo.title)}</title>
    <meta name="description" content="${escapeHtml(seo.description)}" />
    <link rel="canonical" href="${escapeHtml(seo.canonical)}" />
    <link rel="alternate" hreflang="fa" href="${escapeHtml(seo.alternateFa)}" />
    <link rel="alternate" hreflang="en" href="${escapeHtml(seo.alternateEn)}" />
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(seo.alternateFa)}" />
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
    <script type="application/ld+json">${jsonLd}</script>
  `.trim();
}

function stripManagedHead(html) {
  return html
    .replace(/<title>[^]*?<\/title>/i, "")
    .replace(/<meta\s+name="description"[^>]*>/i, "")
    .replace(/<link\s+rel="canonical"[^>]*>/i, "")
    .replace(/<link\s+rel="alternate"[^>]*>/gi, "")
    .replace(/<meta\s+property="og:[^"]+"[^>]*>/gi, "")
    .replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi, "")
    .replace(/<script\s+type="application\/ld\+json">[^]*?<\/script>/gi, "");
}

function injectHtml(template, { html, seo, lang }) {
  const dir = lang === "en" ? "ltr" : "rtl";
  let out = stripManagedHead(template);
  out = out.replace(/<html[^>]*>/i, `<html lang="${lang}" dir="${dir}">`);
  out = out.replace(/<\/head>/i, `${buildHeadTags(seo, lang)}\n  </head>`);
  out = out.replace(
    /<div id="root"><\/div>|<div id="root">[\s\S]*?<\/div>/i,
    `<div id="root">${html}</div>`
  );
  return out;
}

function outFileForPath(urlPath) {
  if (urlPath === "/") return path.join(dist, "index.html");
  if (urlPath === "/404") return path.join(dist, "404.html");
  if (urlPath === "/en/404") return path.join(dist, "en", "404.html");
  const clean = urlPath.replace(/\/+$/, "");
  return path.join(dist, clean.slice(1), "index.html");
}

async function main() {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Missing ${templatePath} — run vite build first`);
  }
  if (!fs.existsSync(serverEntry)) {
    throw new Error(`Missing ${serverEntry} — run vite SSR build first`);
  }

  process.env.SITE_URL = process.env.SITE_URL || getSiteUrl();

  const mod = await import(pathToFileURL(serverEntry).href);
  const { render, listPrerenderPaths } = mod;
  const template = fs.readFileSync(templatePath, "utf8");
  const paths = listPrerenderPaths();

  for (const urlPath of paths) {
    const result = render(urlPath);
    const file = outFileForPath(urlPath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const page = injectHtml(template, result);
    fs.writeFileSync(file, page, "utf8");
    console.log(`prerender ${urlPath} → ${path.relative(ROOT, file)}`);
  }

  // Drop the SSR bundle — deploy stays static-only.
  fs.rmSync(path.join(dist, "server"), { recursive: true, force: true });
  console.log(`Prerendered ${paths.length} routes (SITE_URL=${getSiteUrl()})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
