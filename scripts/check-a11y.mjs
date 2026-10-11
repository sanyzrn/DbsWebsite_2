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
import { chromium } from "playwright";
import { ROOT } from "./site-url.mjs";

const DIST = path.join(ROOT, "dist");

/** Exported so unit tests can assert contrast checking is enabled. */
export const AXE_RUN_OPTIONS = {
  rules: {
    "color-contrast": { enabled: true },
  },
};

/**
 * Prerendered routes to axe-scan — one per distinct layout, plus an LTR page so the
 * English direction is covered too. Detail routes name a preferred slug and fall back
 * to whatever is published, since content maturity decides what actually ships.
 */
export const A11Y_ROUTES = [
  { urlPath: "/nex/", file: "nex/index.html" },
  { urlPath: "/en/nex/", file: "en/nex/index.html" },
  { urlPath: "/", file: "index.html" },
  { urlPath: "/en", file: "en/index.html" },
  { urlPath: "/projects", file: "projects/index.html" },
  { urlPath: "/articles", file: "articles/index.html" },
  { urlPath: "/about", file: "about/index.html" },
  { urlPath: "/contact", file: "contact/index.html" },
  { urlPath: "/404", file: "404.html" },
  { urlPath: "/projects/dbsai", file: "projects/dbsai/index.html", fallbackDir: "projects" },
  {
    urlPath: "/articles/nexahr-from-spreadsheet-to-system",
    file: "articles/nexahr-from-spreadsheet-to-system/index.html",
    fallbackDir: "articles",
  },
];

const THEMES = [
  { name: "light", dark: false },
  { name: "dark", dark: true },
];

function resolveRoute(route, dist = DIST) {
  const preferred = path.join(dist, route.file);
  if (fs.existsSync(preferred)) return { ...route, abs: preferred };
  if (!route.fallbackDir) return null;

  // The preferred slug is unpublished — scan for any published sibling instead.
  const dir = path.join(dist, route.fallbackDir);
  if (!fs.existsSync(dir)) return null;
  for (const name of fs.readdirSync(dir)) {
    const candidate = path.join(dir, name, "index.html");
    if (fs.existsSync(candidate)) {
      return {
        urlPath: `/${route.fallbackDir}/${name}`,
        file: `${route.fallbackDir}/${name}/index.html`,
        abs: candidate,
      };
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
  const axePath = path.join(ROOT, "node_modules", "axe-core", "axe.min.js");
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url ?? "/", "http://127.0.0.1");
        let urlPath = decodeURIComponent(url.pathname);

        // Same-origin axe bundle for Playwright — CSP script-src 'self' allows this;
        // inline addScriptTag({ content }) would need a nonce Playwright doesn't support.
        if (urlPath === "/__a11y/axe.js") {
          if (!fs.existsSync(axePath)) {
            res.writeHead(500).end("axe-core missing");
            return;
          }
          res.writeHead(200, {
            "Content-Type": "text/javascript; charset=utf-8",
            "Cache-Control": "no-store",
          });
          fs.createReadStream(axePath).pipe(res);
          return;
        }

        if (urlPath.endsWith("/")) urlPath += "index.html";
        let filePath = path.normalize(path.join(rootDir, urlPath));
        if (!filePath.startsWith(rootDir)) {
          res.writeHead(403).end("Forbidden");
          return;
        }
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          const asIndex = path.join(filePath, "index.html");
          // `/404` and `/en/404` are emitted as flat .html files, not directories.
          const asHtml = `${filePath}.html`;
          if (fs.existsSync(asIndex)) filePath = asIndex;
          else if (fs.existsSync(asHtml)) filePath = asHtml;
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
        const isNex = /^\/(?:en\/)?nex\/?$/.test(route.urlPath);
        const viewports = isNex ? [{ width: 1440, height: 900 }, { width: 820, height: 900 }, { width: 320, height: 740 }] : [{ width: 1280, height: 720 }];
        for (const viewport of viewports) {
        const context = await browser.newContext({ reducedMotion: "reduce", viewport });
        await context.addInitScript((themeName) => {
          try {
            localStorage.setItem("sz-theme", themeName);
          } catch {
            /* ignore */
          }
        }, theme.name);
        const page = await context.newPage();
        const runtimeErrors = [];
        page.on("pageerror", (error) => runtimeErrors.push(String(error)));
        page.on("console", (message) => {
          if (message.type() === "error") runtimeErrors.push(message.text());
        });
        const url = `${origin}${route.urlPath === "/" ? "/" : route.urlPath}`;
        await page.goto(url, { waitUntil: "networkidle" });
        await page.evaluate(`document.documentElement.classList.toggle("dark", ${theme.dark});`);

        // Force scroll-reveal / enter animations to their settled visible state so
        // axe color-contrast isn't measuring opacity:0 placeholders.
        // Use evaluate (CDP) instead of addScriptTag/addStyleTag — those insert
        // nonce-less inline script/style nodes that CSP rejects.
        await page.evaluate(`
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
          document.querySelectorAll(".page-enter").forEach((el) => {
            el.style.setProperty("animation", "none", "important");
            el.style.setProperty("opacity", "1", "important");
            el.style.setProperty("transform", "none", "important");
          });
        `);
        await page.waitForTimeout(40);

        if (isNex) {
          if (await page.locator(".nex-store-links button:disabled").count() !== 5) throw new Error("Nex must show five coming-soon stores");
          const logosLoaded = await page.locator(".nex-store-links img").evaluateAll((images) => images.every((img) => img.complete && img.naturalWidth > 0));
          if (!logosLoaded) throw new Error("Nex store logos did not load");
          await page.locator('input[name="nex-capture-mode"][value="voice"]').focus();
          await page.locator('input[name="nex-capture-mode"][value="voice"]').press("Space");
          if (await page.locator(".nex-universe").getAttribute("data-mode") !== "voice") throw new Error("Nex capture mode did not switch");
          await page.locator("#nex-search-demo").fill(route.urlPath.startsWith("/en") ? "coffee 12" : "كافه 12");
          if (await page.locator(".nex-search-result").getAttribute("data-match") !== "true") throw new Error("Nex locale search example failed");
          await page.locator("#nex-search-demo").fill("");
          await page.locator("#nex-local-note").fill("A browser-only Nex thought");
          await page.reload({ waitUntil: "networkidle" });
          if (await page.locator("#nex-local-note").inputValue() !== "A browser-only Nex thought") throw new Error("Nex local note did not persist");
          await page.locator("#nex-local-note").press("Control+End");
          await page.locator("#nex-local-note").press("Shift+Enter");
          await page.locator("#nex-local-note").press("Enter");
          if (!(await page.locator(".nex-submitted-note").isVisible())) throw new Error("Nex Enter capture failed");
          await page.reload({ waitUntil: "networkidle" });
          if (!(await page.locator(".nex-submitted-note").isVisible())) throw new Error("Nex captured card did not persist");
          await page.locator(".nex-edit-note").click();
          if (await page.locator("#nex-local-note").inputValue() !== "A browser-only Nex thought\n") throw new Error("Nex multiline note did not survive capture/edit");
          await page.locator(".nex-clear").click();
          await page.locator(".nex-vault summary").scrollIntoViewIfNeeded();
          const beforeVault = await page.locator("#nex-first-day").evaluate((el) => el.getBoundingClientRect().top + globalThis.scrollY);
          await page.locator(".nex-vault summary").click();
          if (!(await page.locator(".nex-vault").evaluate((el) => el.open))) throw new Error("Nex vault disclosure did not open");
          const afterVault = await page.locator("#nex-first-day").evaluate((el) => el.getBoundingClientRect().top + globalThis.scrollY);
          if (Math.abs(beforeVault - afterVault) > 1) throw new Error("Nex vault displaced the timeline below it");
          await page.locator(".nex-vault summary").click();
          const afterClose = await page.locator("#nex-first-day").evaluate((el) => el.getBoundingClientRect().top + globalThis.scrollY);
          if (Math.abs(beforeVault - afterClose) > 1) throw new Error("Nex vault close displaced the timeline");
          await page.locator(".nex-ai-switch").focus();
          await page.locator(".nex-ai-switch").press("Space");
          if (await page.locator(".nex-ai-switch").getAttribute("aria-checked") !== "true" || await page.locator(".nex-ai-connections li").count() !== 3) throw new Error("Nex AI demo did not connect the example thought");
          const thought = await page.locator(".nex-ai-seed").textContent();
          await page.locator(".nex-ai-next").click();
          if (await page.locator(".nex-ai-seed").textContent() === thought) throw new Error("Nex AI next example did not change");
          await page.locator('.nex-footer a[href="#nex-top"]').click();
          await page.waitForFunction(() => globalThis.scrollY <= 1);
          const layout = await page.evaluate(() => {
            const width = globalThis.innerWidth;
            const elements = [...globalThis.document.querySelectorAll(".nex-page .nex-card, .nex-store, .nex-hero-copy, .nex-capture-switch, .nex-chapter-intro")];
            return elements.filter((el) => {
              const box = el.getBoundingClientRect();
              return box.left < -1 || box.right > width + 1;
            }).map((el) => el.className);
          });
          if (layout.length) throw new Error(`Nex layout overflows at ${viewport.width}px: ${layout.join(", ")}`);
        }

        // Load axe as a same-origin external script (CSP script-src 'self').
        // Playwright's addScriptTag has no nonce option, so inline content is blocked.
        await page.addScriptTag({ url: `${origin}/__a11y/axe.js` });
        const axeResults = await page.evaluate(`axe.run(document, ${JSON.stringify(AXE_RUN_OPTIONS)})`);

        if (runtimeErrors.length) {
          throw new Error(`${route.urlPath} [${theme.name}] runtime/hydration errors:\n${runtimeErrors.join("\n")}`);
        }

        const serious = axeResults.violations.filter(
          (v) => v.impact === "critical" || v.impact === "serious"
        );
        results.push({
          path: `${route.urlPath} [${theme.name}, ${viewport.width}px]`,
          violations: serious,
        });
        await context.close();
        }
      }
      // The world and chronological content must also stand alone as static HTML.
      if (/^\/(?:en\/)?nex\/?$/.test(route.urlPath)) {
        for (const colorScheme of ["light", "dark"]) {
          const context = await browser.newContext({ javaScriptEnabled: false, colorScheme, viewport: { width: 320, height: 740 } });
          const page = await context.newPage();
          await page.goto(`${origin}${route.urlPath}`, { waitUntil: "networkidle" });
          if (!(await page.locator("#nex-hero-title").isVisible()) || !(await page.locator(".nex-origin-copy").isVisible())) throw new Error("Nex static content is missing");
          if (!(await page.locator("#nex-local-note").isDisabled())) throw new Error("Nex no-JS demo must clearly be disabled");
          if (!(await page.locator(".nex-ai-switch").isDisabled())) throw new Error("Nex no-JS AI demo must clearly be disabled");
          await page.locator(".nex-vault summary").click();
          if (!(await page.locator(".nex-vault > p").isVisible())) throw new Error("Nex native disclosure failed without JavaScript");
          await context.close();
        }
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
