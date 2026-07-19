/**
 * Accessibility smoke check against key prerendered routes.
 *
 * Chosen approach: axe-core + jsdom over the built HTML in dist/
 * (lighter than a full Playwright install for CI). Runs after `npm run build`.
 *
 * Routes: home (/), one project detail page, /about.
 *
 * Usage: node scripts/check-a11y.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import axe from "axe-core";
import { ROOT, getSiteUrl } from "./site-url.mjs";

const DIST = path.join(ROOT, "dist");
const siteUrl = getSiteUrl();

/** Key prerendered routes to axe-scan. */
const ROUTES = [
  { urlPath: "/", file: "index.html" },
  { urlPath: "/about", file: "about/index.html" },
  { urlPath: "/contact", file: "contact/index.html" },
  // Prefer a known shipped project slug; fall back to first dist/projects/*/index.html.
  { urlPath: "/projects/dbsai", file: "projects/dbsai/index.html", optionalFallback: true },
];

function resolveRoute(route) {
  const preferred = path.join(DIST, route.file);
  if (fs.existsSync(preferred)) return { ...route, abs: preferred };
  if (!route.optionalFallback) return null;
  const projectsDir = path.join(DIST, "projects");
  if (!fs.existsSync(projectsDir)) return null;
  for (const name of fs.readdirSync(projectsDir)) {
    const candidate = path.join(projectsDir, name, "index.html");
    if (fs.existsSync(candidate)) {
      return { urlPath: `/projects/${name}`, file: `projects/${name}/index.html`, abs: candidate };
    }
  }
  return null;
}

if (!fs.existsSync(DIST)) {
  throw new Error("dist/ missing — run `npm run build` before check:a11y");
}

const results = [];

for (const route of ROUTES) {
  const resolved = resolveRoute(route);
  if (!resolved) {
    throw new Error(`Missing prerendered HTML for ${route.urlPath} (${route.file})`);
  }

  const html = fs.readFileSync(resolved.abs, "utf8");
  const dom = new JSDOM(html, {
    url: `${siteUrl}${resolved.urlPath === "/" ? "/" : resolved.urlPath}`,
    contentType: "text/html",
    runScripts: "outside-only",
  });

  // Inject axe into the jsdom window and run against the document.
  const { window } = dom;
  window.eval(axe.source);
  const axeResults = await window.axe.run(window.document, {
    // Keep CI signal high-value; color-contrast on prerendered static HTML
    // without stylesheets fully applied is noisy in jsdom.
    rules: {
      "color-contrast": { enabled: false },
    },
  });

  const serious = axeResults.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious"
  );
  results.push({ path: resolved.urlPath, violations: serious });
}

const failing = results.filter((r) => r.violations.length > 0);
if (failing.length) {
  const detail = failing
    .map((r) => {
      const lines = r.violations.map(
        (v) => `  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`
      );
      return `${r.path}:\n${lines.join("\n")}`;
    })
    .join("\n");
  throw new Error(`check:a11y failed — serious/critical axe violations:\n${detail}`);
}

console.log(
  `check:a11y OK — axe-core+jsdom scanned ${results.map((r) => r.path).join(", ")} (no serious/critical)`
);
