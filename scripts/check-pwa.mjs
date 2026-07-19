/**
 * PWA installability checklist against a running preview server.
 * Note: full Lighthouse PWA audit needs a working headed/headless Chrome;
 * this script covers the same installability criteria without Chrome.
 *
 * Usage: node scripts/check-pwa.mjs [baseUrl]
 */
import http from "node:http";
import https from "node:https";

const base = (process.argv[2] || "http://127.0.0.1:4173").replace(/\/+$/, "");
const client = base.startsWith("https") ? https : http;

function get(url) {
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () =>
        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) })
      );
    }).on("error", reject);
  });
}

const checks = [];
const ok = (name, pass, detail = "") => {
  checks.push({ name, pass: !!pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
};

const html = await get(base + "/");
ok("Home responds 200", html.status === 200);
ok("theme-color is #bc9463", html.body.toString().includes('content="#bc9463"'));
ok("manifest link present", /rel=["']manifest["']/.test(html.body.toString()));

const man = await get(base + "/manifest.webmanifest");
ok("manifest.webmanifest 200", man.status === 200);
const m = JSON.parse(man.body.toString());
ok("manifest.name", !!m.name && m.name.includes("Saeed Zarrini"));
ok("manifest.short_name", m.short_name === "Saeed Zarrini");
ok("manifest.start_url /", m.start_url === "/");
ok("manifest.display standalone", m.display === "standalone");
ok("manifest.background_color", m.background_color?.toLowerCase() === "#f5f0e8");
ok("manifest.theme_color", m.theme_color?.toLowerCase() === "#bc9463");
ok("manifest description from SEO", /idea and shipping/i.test(m.description || ""));
const sizes = new Set((m.icons || []).flatMap((i) => (i.sizes || "").split(" ")));
ok("icon 192x192", sizes.has("192x192"));
ok("icon 512x512", sizes.has("512x512"));
ok("maskable icon", (m.icons || []).some((i) => String(i.purpose || "").includes("maskable")));

for (const icon of m.icons || []) {
  const r = await get(base + "/" + icon.src.replace(/^\//, ""));
  ok(`icon fetch ${icon.src}`, r.status === 200 && r.body.length > 100, `${r.body.length} bytes`);
}

const sw = await get(base + "/sw.js");
ok("service worker sw.js 200", sw.status === 200);
ok("sw precacheAndRoute", sw.body.toString().includes("precacheAndRoute"));
ok("sw navigateFallback offline.html", sw.body.toString().includes("/offline.html"));
ok("sw denylist admin/php", /admin/.test(sw.body.toString()) && /\.php/.test(sw.body.toString()));
ok("sw CacheFirst images", sw.body.toString().includes("CacheFirst"));
ok("sw NetworkFirst seo", sw.body.toString().includes("NetworkFirst"));
ok("sw revisioning active", /revision:"[a-f0-9]+"/.test(sw.body.toString()));
ok("precache includes en locale HTML", sw.body.toString().includes("en/about/index.html"));

const off = await get(base + "/offline.html");
ok("offline.html 200", off.status === 200);
ok(
  "offline page bilingual copy",
  /You're offline/i.test(off.body.toString()) && /آفلاین/.test(off.body.toString())
);

const failed = checks.filter((c) => !c.pass);
console.log("\n---");
console.log(`${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length) {
  console.error("Failed:", failed.map((f) => f.name).join(", "));
  process.exit(1);
}
console.log("PWA installability checklist OK");
