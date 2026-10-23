/** Shared by the snapshot builder and browser. No HTML from GitHub is executed. */
export const NEX_RELEASES_URL = "https://github.com/sanyzrn/DbsNex-releases/releases";
export const NEX_RELEASES_API = "https://api.github.com/repos/sanyzrn/DbsNex-releases/releases?per_page=100";
const VERSION = /^v?(\d+)\.(\d+)\.(\d+)$/;

export function compareVersions(a, b) {
  const left = a.match(VERSION);
  const right = b.match(VERSION);
  if (!left || !right) return 0;
  for (let i = 1; i <= 3; i++) {
    const diff = Number(left[i]) - Number(right[i]);
    if (diff) return diff;
  }
  return 0;
}

export function safeReleaseUrl(value, asset = false) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.origin !== "https://github.com" || url.username || url.password || url.search || url.hash) return null;
    const parts = url.pathname.split("/");
    if (parts[1] !== "sanyzrn" || parts[2] !== "DbsNex-releases" || parts[3] !== "releases") return null;
    if (asset) {
      if (parts.length !== 7 || parts[4] !== "download" || !VERSION.test(decodeURIComponent(parts[5]))) return null;
      const name = decodeURIComponent(parts[6]);
      if (!name || /[/\\\u0000-\u001f]/.test(name) || name === "." || name === "..") return null;
    } else if (parts.length !== 6 || parts[4] !== "tag" || !VERSION.test(decodeURIComponent(parts[5]))) return null;
    return url.href;
  } catch { return null; }
}

export function assetKind(name) {
  if (/-arm64-v8a\.apk$/i.test(name)) return "arm64";
  if (/-armeabi-v7a\.apk$/i.test(name)) return "arm32";
  if (/-x86_64\.apk$/i.test(name)) return "x64";
  if (/-universal\.apk$/i.test(name)) return "universal";
  if (/\.aab$/i.test(name)) return "bundle";
  return "other";
}

export function releaseNotes(body) {
  const [en, fa] = body.split(/<!--\s*nex:fa\s*-->/i);
  return { en: en.trim(), fa: fa?.trim() || null };
}

/** Reject malformed data before persisting it or creating any download link. */
export function normalizeReleases(payload) {
  if (!Array.isArray(payload)) throw new Error("Expected GitHub releases array");
  const releases = [];
  const seen = new Set();
  for (const raw of payload) {
    if (!raw || raw.draft !== false || raw.prerelease !== false || typeof raw.tag_name !== "string" || !VERSION.test(raw.tag_name)) continue;
    const version = raw.tag_name.replace(/^v/, "");
    const url = safeReleaseUrl(raw.html_url);
    if (seen.has(version) || !url || decodeURIComponent(new URL(url).pathname.split("/")[5]) !== raw.tag_name || !Number.isFinite(Date.parse(raw.published_at))) continue;
    const assets = (Array.isArray(raw.assets) ? raw.assets : []).slice(0, 1000).flatMap((a) => {
      if (!a || typeof a.name !== "string") return [];
      const href = safeReleaseUrl(a.browser_download_url, true);
      if (!href || !Number.isSafeInteger(a.size) || a.size < 0) return [];
      const parts = new URL(href).pathname.split("/");
      if (decodeURIComponent(parts[5]) !== raw.tag_name || decodeURIComponent(parts[6]) !== a.name) return [];
      return [{ name: a.name, url: href, kind: assetKind(a.name), size: a.size,
        downloads: Number.isSafeInteger(a.download_count) && a.download_count >= 0 ? a.download_count : 0,
        sha256: typeof a.digest === "string" && /^sha256:[a-f0-9]{64}$/i.test(a.digest) ? a.digest.slice(7).toLowerCase() : null }];
    });
    seen.add(version);
    releases.push({ version, tag: raw.tag_name, url, publishedAt: new Date(raw.published_at).toISOString(),
      notes: releaseNotes(typeof raw.body === "string" ? raw.body.slice(0, 100000) : ""), assets });
  }
  return releases.sort((a, b) => compareVersions(b.version, a.version));
}

/** UA data is often deliberately vague: only explicit architecture evidence wins. */
export function selectApk(assets, hint = "") {
  const kind = /aarch64|arm64/i.test(hint) ? "arm64" : /armeabi-v7a|armv7/i.test(hint) ? "arm32" : /x86_64|amd64/i.test(hint) ? "x64" : "universal";
  return assets.find((a) => a.kind === kind) ?? assets.find((a) => a.kind === "universal") ?? null;
}
