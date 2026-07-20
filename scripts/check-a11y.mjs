/**
 * Accessibility smoke check against key prerendered routes.
 *
 * Uses Playwright + axe-core in a real Chromium context so color-contrast
 * is evaluated against rendered CSS (jsdom cannot compute real contrast).
 *
 * Usage: node scripts/check-a11y.mjs   (requires `dist/` from `npm run build`)
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import axe from "axe-core";
import { chromium } from "playwright";
import { ROOT } from "./site-url.mjs";

const DIST = path.join(ROOT, "dist");

/** Exported so unit tests can assert contrast checking is enabled. */
export const AXE_RUN_OPTIONS = {
  rules: {
    "color-contrast": { enabled: true },
  },
};

/** Key prerendered routes to axe-scan. */
export const A11Y_ROUTES = [
  { urlPath: "/", file: "index.html" },
  { urlPath: "/about", file: "about/index.html" },
  { urlPath: "/contact", file: "contact/index.html" },
  { urlPath: "/projects/dbsai", file: "projects/dbsai/index.html", optionalFallback: true },
];

const THEMES = [
  { name: "light", dark: false },
  { name: "dark", dark: true },
];

function resolveRoute(route, dist = DIST) {
  const preferred = path.join(dist, route.file);
  if (fs.existsSync(preferred)) return { ...route, abs: preferred };
  if (!route.optionalFallback) return null;
  const projectsDir = path.join(dist, "projects");
  if (!fs.existsSync(projectsDir)) return null;
  for (const name of fs.readdirSync(projectsDir)) {
    const candidate = path.join(projectsDir, name, "index.html");
    if (fs.existsSync(candidate)) {
      return { urlPath: `/projects/${name}`, file: `projects/${name}/index.html`, abs: candidate };
    }
  }
  return null;
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".json": "application/json",
      ".txt": "text/plain; charset=utf-8",
      ".xml": "application/xml",
    }[ext] ?? "application/octet-stream"
  );
}

/** Minimal static file server for dist/ (directory → index.html). */
function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url ?? "/", "http://127.0.0.1");
        let urlPath = decodeURIComponent(url.pathname);
        if (urlPath.endsWith("/")) urlPath += "index.html";
        let filePath = path.normalize(path.join(rootDir, urlPath));
        if (!filePath.startsWith(rootDir)) {
          res.writeHead(403).end("Forbidden");
          return;
        }
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          const asIndex = path.join(filePath, "index.html");
          if (fs.existsSync(asIndex)) filePath = asIndex;
          else {
            res.writeHead(404).end("Not found");
            return;
          }
        }
        res.writeHead(200, { "Content-Type": contentType(filePath) });
        fs.createReadStream(filePath).pipe(res);
      } catch (err) {
        res.writeHead(500).end(String(err));
      }
    });
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("Failed to bind static server"));
        return;
      }
      resolve({ server, port: addr.port });
    });
  });
}

export async function runA11yCheck({ routes = A11Y_ROUTES, dist = DIST } = {}) {
  if (!fs.existsSync(dist)) {
    throw new Error("dist/ missing — run `npm run build` before check:a11y");
  }

  const resolvedRoutes = routes.map((route) => {
    const resolved = resolveRoute(route, dist);
    if (!resolved) {
      throw new Error(`Missing prerendered HTML for ${route.urlPath} (${route.file})`);
    }
    return resolved;
  });

  const { server, port } = await startStaticServer(dist);
  const origin = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const route of resolvedRoutes) {
      for (const theme of THEMES) {
        const context = await browser.newContext();
        await context.addInitScript((themeName) => {
          try {
            localStorage.setItem("sz-theme", themeName);
          } catch {
            /* ignore */
          }
        }, theme.name);
        const page = await context.newPage();
        const url = `${origin}${route.urlPath === "/" ? "/" : route.urlPath}`;
        await page.goto(url, { waitUntil: "networkidle" });
        await page.evaluate(`
          document.documentElement.classList.toggle("dark", ${theme.dark});
          document.documentElement.style.colorScheme = ${theme.dark ? '"dark"' : '"light"'};
        `);
        // Force scroll-reveal / enter animations to their settled visible state so
        // axe color-contrast isn't measuring opacity:0 placeholders.
        await page.addScriptTag({
          content: `
            document.querySelectorAll(".reveal").forEach((el) => {
              el.classList.add("in");
              el.style.setProperty("transition", "none", "important");
              el.style.setProperty("opacity", "1", "important");
              el.style.setProperty("transform", "none", "important");
            });
            document.querySelectorAll(".hero-in").forEach((el) => {
              el.style.setProperty("animation", "none", "important");
              el.style.setProperty("opacity", "1", "important");
              el.style.setProperty("transform", "none", "important");
            });
          `,
        });
        await page.addStyleTag({
          content: `
            .reveal {
              opacity: 1 !important;
              transform: none !important;
              transition: none !important;
            }
            .hero-in {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }
            .page-enter { animation: none !important; opacity: 1 !important; transform: none !important; }
          `,
        });
        await page.waitForTimeout(40);
        await page.addScriptTag({ content: axe.source });
        const axeResults = await page.evaluate(`axe.run(document, ${JSON.stringify(AXE_RUN_OPTIONS)})`);

        const serious = axeResults.violations.filter(
          (v) => v.impact === "critical" || v.impact === "serious"
        );
        results.push({
          path: `${route.urlPath} [${theme.name}]`,
          violations: serious,
        });
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }

  return results;
}

async function main() {
  const results = await runA11yCheck();
  const failing = results.filter((r) => r.violations.length > 0);
  if (failing.length) {
    const detail = failing
      .map((r) => {
        const lines = r.violations.map((v) => {
          let line = `  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`;
          if (v.id === "color-contrast") {
            const samples = v.nodes
              .slice(0, 4)
              .map((n) => {
                const summary = n.failureSummary?.split("\n")[0] ?? "";
                const html = (n.html ?? "").replace(/\s+/g, " ").slice(0, 100);
                return `    · ${summary} — ${html}`;
              })
              .join("\n");
            line += `\n${samples}`;
          }
          return line;
        });
        return `${r.path}:\n${lines.join("\n")}`;
      })
      .join("\n");
    throw new Error(`check:a11y failed — serious/critical axe violations:\n${detail}`);
  }

  console.log(
    `check:a11y OK — Playwright+axe scanned ${results.map((r) => r.path).join(", ")} ` +
      `(color-contrast enabled; no serious/critical)`
  );
}

const isDirectRun =
  Boolean(process.argv[1]) && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  await main();
}
