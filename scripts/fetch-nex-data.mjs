/** Atomic, reproducible snapshots. Network failure preserves the committed data. */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { NEX_RELEASES_API, normalizeReleases } from "../shared/nex-releases.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const destination = path.join(root, "content/nex");
const strict = process.argv.includes("--strict");
const offline = process.argv.includes("--offline") || process.env.NEX_DATA_OFFLINE === "1";
const json = (data) => JSON.stringify(data, null, 2) + "\n";
const headers = { Accept: "application/vnd.github+json", "User-Agent": "DbsStudio-Nex-website" };
// An optional build-only token can read private app source; never prefixed VITE_.
if (process.env.NEX_SOURCE_TOKEN) headers.Authorization = `Bearer ${process.env.NEX_SOURCE_TOKEN}`;

async function get(url, format = "json") {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`GitHub HTTP ${response.status}`);
  if (format === "bytes") return Buffer.from(await response.arrayBuffer());
  return format === "text" ? response.text() : response.json();
}
async function writeIfChanged(file, content) {
  try { if (await fs.readFile(file, typeof content === "string" ? "utf8" : undefined).then((old) => typeof content === "string" ? old === content : old.equals(content))) return; } catch { /* first snapshot */ }
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(`${file}.tmp`, content);
  await fs.rename(`${file}.tmp`, file);
}

async function refreshReleases() {
  // Pages contain all public stable releases, not a fabricated download total.
  const raw = [];
  for (let page = 1; page <= 20; page++) {
    const entries = await get(`${NEX_RELEASES_API}&page=${page}`);
    if (!Array.isArray(entries)) throw new Error("Invalid releases response");
    raw.push(...entries);
    if (entries.length < 100) break;
    if (page === 20) throw new Error("Release pagination limit reached");
  }
  const releases = normalizeReleases(raw);
  if (!releases.length) throw new Error("No valid stable release");
  await writeIfChanged(path.join(destination, "releases.json"), json({ schemaVersion: 1, releases }));
  // Keep the landing page bundle small; the full archive is for its own route.
  await writeIfChanged(path.join(destination, "latest.json"), json({ schemaVersion: 1, releases: releases.slice(0, 8).map((release, i) => i === 0 ? release : { ...release, notes: { en: "", fa: null }, assets: [] }) }));
  return releases[0].version;
}

async function refreshProduct(version) {
  // Pin every source file to one revision, never a moving mixture of main.
  const commit = await get("https://api.github.com/repos/sanyzrn/DbsNex/commits/main");
  if (!/^[a-f0-9]{40}$/.test(commit.sha)) throw new Error("Invalid source revision");
  const raw = `https://raw.githubusercontent.com/sanyzrn/DbsNex/${commit.sha}/`;
  const pubspec = await get(raw + "apps/client/pubspec.yaml", "text");
  if (pubspec.match(/^version:\s*(\d+\.\d+\.\d+)/m)?.[1] !== version) throw new Error("Source version is ahead of the public release; keeping product snapshot");
  const sources = [
    ["guide.fa.md", "apps/client/assets/guide/fa.md"],
    ["guide.en.md", "apps/client/assets/guide/en.md"],
    ["changelog.fa.md", "CHANGELOG.fa.md"],
    ["changelog.en.md", "CHANGELOG.md"],
    ["theme-presets.dart", "apps/client/lib/platform/theme_presets.dart"],
    ["module-rollout.dart", "apps/client/lib/modules/module_rollout.dart"],
    ["privacy.fa.md", "apps/client/assets/privacy/fa.md"],
    ["privacy.en.md", "apps/client/assets/privacy/en.md"],
  ];
  const results = await Promise.all(sources.map(async ([name, source]) => [name, await get(raw + source, "text")]));
  if (results.some(([, text]) => text.length < 20)) throw new Error("Empty product source");
  const guideImages = [...new Set(results.filter(([name]) => name.startsWith("guide.")).flatMap(([, text]) => [...text.matchAll(/!\[[^\]]*\]\(([-a-zA-Z0-9_]+\.webp)\)/g)].map((m) => m[1])))].sort();
  const images = await Promise.all(guideImages.map(async (name) => {
    const bytes = await get(raw + "apps/client/assets/guide/images/" + name, "bytes");
    const { width, height, format } = await sharp(bytes).metadata();
    if (!width || !height || format !== "webp") throw new Error("Invalid guide image");
    return { name, bytes, width, height, sha256: createHash("sha256").update(bytes).digest("hex") };
  }));
  // Current upstream images are placeholders. A changed file is not automatically
  // a real screenshot: approve its hash only after inspecting its pixels.
  const approvedImages = JSON.parse(await fs.readFile(path.join(destination, "verified-images.json"), "utf8"));
  const rollout = results.find(([name]) => name === "module-rollout.dart")[1];
  const moduleSet = rollout.match(/const nexAvailableModuleIds\s*=\s*\{([^}]*)\}/)?.[1];
  if (moduleSet === undefined) throw new Error("Module rollout format changed");
  const availableModules = [...moduleSet.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
  // Only write a complete source set. Metadata is the final commit marker.
  for (const [name, text] of results) await writeIfChanged(path.join(destination, name), text);
  for (const image of images) if (approvedImages[image.name] === image.sha256) await writeIfChanged(path.join(root, "public/images/nex/guide", image.name), image.bytes);
  await writeIfChanged(path.join(destination, "product.json"), json({ schemaVersion: 1, version, sourceRevision: commit.sha, availableModules,
    images: images.map(({ name, width, height, sha256 }) => ({ name, src: approvedImages[name] === sha256 ? `/images/nex/guide/${name}` : null, verified: approvedImages[name] === sha256, sha256, width, height })) }));
}

try {
  if (!offline) {
    const version = await refreshReleases();
    try { await refreshProduct(version); }
    catch (error) {
      if (strict) throw error;
      console.warn(`Nex product snapshot retained: ${error.message}`);
    }
  }
} catch (error) {
  if (strict) throw error;
  console.warn(`Nex snapshot retained: ${error.message}`);
}
// A first-ever missing or corrupt snapshot is actionable, rather than a fake release.
const saved = JSON.parse(await fs.readFile(path.join(destination, "releases.json"), "utf8"));
if (saved.schemaVersion !== 1 || !saved.releases?.length) throw new Error("A valid committed Nex snapshot is required");
console.log(`Nex snapshot ready: v${saved.releases[0].version}${offline ? " (offline)" : ""}`);
