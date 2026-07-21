/**
 * Content-Security-Policy helpers for the static prerendered site.
 *
 * Inline scripts (FOUC bootstrap + JSON-LD) get a per-build nonce — hashing every
 * page's JSON-LD would produce dozens of sha256 entries and still break SPA
 * client reinjection of JSON-LD via PageMeta. A single build nonce is injected
 * into every prerendered page + hosting CSP headers.
 *
 * style-src drops 'unsafe-inline' in favor of 'unsafe-hashes' + SHA-256 hashes of
 * every distinct style="…" attribute found in dist/ after prerender (React SSR).
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./site-url.mjs";

export const CSP_NONCE_META = "csp-nonce";

/** Stable CSP directives that never include script/style source lists. */
const CSP_BASE = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://formspree.io",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://formspree.io",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
];

export function createBuildNonce() {
  return crypto.randomBytes(16).toString("base64url");
}

export function sha256Integrity(content) {
  const hash = crypto.createHash("sha256").update(content, "utf8").digest("base64");
  return `'sha256-${hash}'`;
}

/**
 * Build the full Content-Security-Policy header value.
 * @param {{ nonce: string, styleHashes?: string[] }} opts
 */
export function buildCspHeader({ nonce, styleHashes = [] }) {
  const scriptSrc = `script-src 'self' 'nonce-${nonce}'`;
  const uniqueStyles = [...new Set(styleHashes)].sort();
  const styleSrc =
    uniqueStyles.length > 0
      ? `style-src 'self' 'unsafe-hashes' ${uniqueStyles.join(" ")}`
      : `style-src 'self'`;
  return [...CSP_BASE, scriptSrc, styleSrc].join("; ");
}

/** Collect unique style="…" attribute values from HTML and return CSP hash tokens. */
export function collectStyleAttributeHashes(html) {
  const hashes = new Set();
  const re = /\sstyle\s*=\s*"([^"]*)"/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    hashes.add(sha256Integrity(m[1]));
  }
  const re2 = /\sstyle\s*=\s*'([^']*)'/gi;
  while ((m = re2.exec(html)) !== null) {
    hashes.add(sha256Integrity(m[1]));
  }
  return [...hashes];
}

/** Walk dist/ for .html files (skip server/). */
export function walkHtmlFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "server" || entry.name === "assets") continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtmlFiles(abs, out);
    else if (entry.name.endsWith(".html")) out.push(abs);
  }
  return out;
}

/**
 * Inject nonce into FOUC + JSON-LD scripts and add csp-nonce meta.
 * Call after head/body injection for each prerendered page.
 */
export function applyNonceToHtml(html, nonce) {
  let out = html;
  // FOUC bootstrap (first bare <script> without type/src)
  out = out.replace(
    /<script(?![^>]*\bnonce=)(?![^>]*\btype=)(?![^>]*\bsrc=)>/i,
    `<script nonce="${nonce}">`
  );
  // JSON-LD blocks
  out = out.replace(
    /<script(\s+type="application\/ld\+json")(?![^>]*\bnonce=)>/gi,
    `<script nonce="${nonce}"$1>`
  );
  // Meta for client PageMeta reinjection
  if (!out.includes(`name="${CSP_NONCE_META}"`)) {
    out = out.replace(
      /<\/head>/i,
      `    <meta name="${CSP_NONCE_META}" content="${nonce}" />\n  </head>`
    );
  }
  return out;
}

/**
 * Write the CSP string into every host config that embeds it, keeping them in sync.
 * Also writes hosting/csp-header.txt as the single readable source.
 */
export function writeCspToHostingConfigs(cspHeader) {
  const hostingDir = path.join(ROOT, "hosting");
  fs.mkdirSync(hostingDir, { recursive: true });
  fs.writeFileSync(path.join(hostingDir, "csp-header.txt"), `${cspHeader}\n`, "utf8");

  // Root + hosting vercel.json
  for (const rel of ["vercel.json", "hosting/vercel.json"]) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const json = JSON.parse(fs.readFileSync(abs, "utf8"));
    let updated = false;
    for (const route of json.routes ?? []) {
      if (route.headers && "Content-Security-Policy" in route.headers) {
        route.headers["Content-Security-Policy"] = cspHeader;
        updated = true;
      }
    }
    if (updated) {
      fs.writeFileSync(abs, `${JSON.stringify(json, null, 2)}\n`, "utf8");
    }
  }

  // Apache
  const apache = path.join(hostingDir, "apache.htaccess.example");
  if (fs.existsSync(apache)) {
    let text = fs.readFileSync(apache, "utf8");
    text = text.replace(
      /Header set Content-Security-Policy "[^"]*"/,
      `Header set Content-Security-Policy "${cspHeader}"`
    );
    fs.writeFileSync(apache, text, "utf8");
  }

  // Nginx
  const nginx = path.join(hostingDir, "nginx.conf.example");
  if (fs.existsSync(nginx)) {
    let text = fs.readFileSync(nginx, "utf8");
    text = text.replace(
      /add_header Content-Security-Policy "[^"]*" always;/,
      `add_header Content-Security-Policy "${cspHeader}" always;`
    );
    fs.writeFileSync(nginx, text, "utf8");
  }

  // Netlify
  const netlify = path.join(hostingDir, "netlify.toml.example");
  if (fs.existsSync(netlify)) {
    let text = fs.readFileSync(netlify, "utf8");
    text = text.replace(
      /Content-Security-Policy = "[^"]*"/,
      `Content-Security-Policy = "${cspHeader}"`
    );
    fs.writeFileSync(netlify, text, "utf8");
  }

  // Cloudflare _headers
  const cf = path.join(hostingDir, "cloudflare", "_headers.example");
  if (fs.existsSync(cf)) {
    let text = fs.readFileSync(cf, "utf8");
    text = text.replace(
      /Content-Security-Policy: .*/,
      `Content-Security-Policy: ${cspHeader}`
    );
    fs.writeFileSync(cf, text, "utf8");
  }
}
