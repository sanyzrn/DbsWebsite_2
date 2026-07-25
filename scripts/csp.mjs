/**
 * Content-Security-Policy helpers for the static prerendered site.
 *
 * Inline scripts (FOUC bootstrap + JSON-LD) are whitelisted via sha256 hashes
 * computed at prerender time from their exact body text. This avoids the
 * per-build nonce approach (which requires stamping every page + every hosting
 * config with the same secret token, and breaks SPA JSON-LD reinjection).
 *
 * style-src drops 'unsafe-inline' in favour of 'unsafe-hashes' + SHA-256 hashes
 * of every distinct style="…" attribute found in dist/ after prerender (React SSR).
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./site-url.mjs";

export function sha256Integrity(content) {
  const hash = crypto.createHash("sha256").update(content, "utf8").digest("base64");
  return `'sha256-${hash}'`;
}

/**
 * Build the Content-Security-Policy value.
 * @param {{ scriptHashes?: string[], styleHashes?: string[], forMeta?: boolean }} opts
 * `forMeta: true` omits header-only directives (e.g. frame-ancestors) so the
 * browser does not warn when the policy is delivered via <meta http-equiv>.
 */
export function buildCspHeader({ scriptHashes = [], styleHashes = [], forMeta = false } = {}) {
  const uniqueScripts = [...new Set(scriptHashes)].sort();
  const scriptSrc =
    uniqueScripts.length > 0
      ? `script-src 'self' ${uniqueScripts.join(" ")}`
      : `script-src 'self'`;
  const uniqueStyles = [...new Set(styleHashes)].sort();
  const styleSrc =
    uniqueStyles.length > 0
      ? `style-src 'self' 'unsafe-hashes' ${uniqueStyles.join(" ")}`
      : `style-src 'self'`;

  /** Shared directives for headers and <meta http-equiv>. */
  const CSP_BASE = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ];

  const parts = forMeta
    ? [...CSP_BASE, scriptSrc, styleSrc]
    : [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        ...CSP_BASE.slice(3),
        scriptSrc,
        styleSrc,
      ];
  return parts.join("; ");
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
 * Write the CSP string into every host config that embeds it, keeping them in sync.
 * Also writes hosting/csp-header.txt as the single readable source.
 */
export function writeCspToHostingConfigs(cspHeader) {
  const hostingDir = path.join(ROOT, "hosting");
  fs.mkdirSync(hostingDir, { recursive: true });
  fs.writeFileSync(path.join(hostingDir, "csp-header.txt"), `${cspHeader}\n`, "utf8");

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
