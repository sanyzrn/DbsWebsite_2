import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { assetKind, compareVersions, normalizeReleases, releaseNotes, safeReleaseUrl, selectApk } from "../../shared/nex-releases.mjs";
import { fetchNexReleases, NEX_RELEASE_CACHE_KEY, NEX_RELEASE_TTL } from "../lib/nexReleaseClient";
import snapshot from "../../content/nex/latest.json";

function fixture(version = "2.3.0") {
  const tag = `v${version}`;
  return { tag_name: tag, draft: false, prerelease: false, published_at: "2026-10-23T08:50:39Z", html_url: `https://github.com/sanyzrn/DbsNex-releases/releases/tag/${tag}`,
    body: "- **New.** A note.\n<!-- nex:fa -->\n- **تازه.** یک یادداشت.",
    assets: ["arm64-v8a", "universal", "riscv64"].map((abi) => ({ name: `Nex-${version}-${abi}.apk`, browser_download_url: `https://github.com/sanyzrn/DbsNex-releases/releases/download/${tag}/Nex-${version}-${abi}.apk`, size: 12345, download_count: 4, digest: `sha256:${"a".repeat(64)}` })) };
}
const seed = normalizeReleases([fixture("2.2.2")]);
const now = 100000000;
beforeEach(() => localStorage.clear());
afterEach(() => { localStorage.clear(); vi.useRealTimers(); });

describe("Nex release ingestion", () => {
  it("orders semantic versions, excludes drafts/prereleases and removes duplicates", () => {
    const data = normalizeReleases([fixture("2.9.0"), fixture("2.10.0"), { ...fixture("2.11.0"), draft: true }, { ...fixture("2.12.0"), prerelease: true }, fixture("2.9.0"), fixture("2.1.0-beta.1")]);
    expect(data.map((r) => r.version)).toEqual(["2.10.0", "2.9.0"]);
    expect(compareVersions("v2.10.0", "2.9.0")).toBeGreaterThan(0);
  });
  it.each(["https://github.com.evil.test/sanyzrn/DbsNex-releases/releases/tag/v2.2.2", "https://github.com/sanyzrn/DbsNex/releases/tag/v2.2.2", "https://user@github.com/sanyzrn/DbsNex-releases/releases/tag/v2.2.2", "javascript:alert(1)", "https://github.com/sanyzrn/DbsNex-releases/releases/tag/v2.2.2?redirect=evil"])("rejects untrusted destination %s", (url) => {
    expect(safeReleaseUrl(url)).toBeNull();
  });
  it("rejects assets of another release, malformed hashes, sizes and mismatched filenames", () => {
    const raw = fixture();
    raw.assets[0].browser_download_url = fixture("2.2.0").assets[0].browser_download_url;
    raw.assets[1].size = -1;
    raw.assets[2].digest = "sha256:invalid";
    const [release] = normalizeReleases([raw]);
    expect(release.assets).toHaveLength(1);
    expect(release.assets[0].sha256).toBeNull();
    expect(normalizeReleases([{ ...fixture(), published_at: "not a date" }])).toEqual([]);
    expect(() => normalizeReleases({ message: "rate limited" })).toThrow();
  });
  it("chooses explicit architectures and leaves unknown devices on universal", () => {
    const { assets } = normalizeReleases([fixture()])[0];
    expect(selectApk(assets)?.kind).toBe("universal");
    expect(selectApk(assets, "Android aarch64")?.kind).toBe("arm64");
    expect(selectApk(assets, "Android 15; Pixel 9")?.kind).toBe("universal");
    expect(assetKind("Nex-3.0.0-riscv64.apk")).toBe("other");
    expect(selectApk(assets.filter((a) => a.kind !== "universal"), "Unknown")).toBeNull();
  });
  it("splits actual bilingual release notes and keeps missing translations explicit", () => {
    expect(releaseNotes(fixture().body)).toEqual({ en: "- **New.** A note.", fa: "- **تازه.** یک یادداشت." });
    expect(releaseNotes("English only")).toEqual({ en: "English only", fa: null });
  });
  it("ships a stable universal APK and approved URLs in the committed snapshot", () => {
    expect(snapshot.releases[0].assets.some((a) => a.kind === "universal")).toBe(true);
    for (const release of snapshot.releases) {
      expect(safeReleaseUrl(release.url)).toBe(release.url);
      for (const asset of release.assets) expect(safeReleaseUrl(asset.url, true)).toBe(asset.url);
    }
  });
});

describe("Nex quiet runtime refresh", () => {
  function cache(checkedAt = now, version = "2.3.0") {
    localStorage.setItem(NEX_RELEASE_CACHE_KEY, JSON.stringify({ checkedAt, etag: 'W/"nex"', payload: [fixture(version)] }));
  }
  it("reads a valid fresh cache without a network request", async () => {
    cache();
    const fetcher = vi.fn<typeof fetch>();
    expect((await fetchNexReleases(seed, { storage: localStorage, fetcher, now }))[0].version).toBe("2.3.0");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("revalidates expired data with ETag and handles 304", async () => {
    cache(now - NEX_RELEASE_TTL - 1);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 304 }));
    expect((await fetchNexReleases(seed, { storage: localStorage, fetcher, now }))[0].version).toBe("2.3.0");
    expect(fetcher.mock.calls[0][1]?.headers).toMatchObject({ "If-None-Match": 'W/"nex"' });
    expect(JSON.parse(localStorage.getItem(NEX_RELEASE_CACHE_KEY)!).checkedAt).toBe(now);
  });
  it("updates the version and persists a response without losing old snapshot entries", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify([fixture()]), { headers: { ETag: 'W/"new"' } }));
    const result = await fetchNexReleases(seed, { storage: localStorage, fetcher, now });
    expect(result.map((r) => r.version)).toEqual(["2.3.0", "2.2.2"]);
    expect(JSON.parse(localStorage.getItem(NEX_RELEASE_CACHE_KEY)!).etag).toBe('W/"new"');
  });
  it("does not downgrade a newer build using an old browser cache", async () => {
    cache(now, "2.0.0");
    expect((await fetchNexReleases(seed, { storage: localStorage, now }))[0].version).toBe("2.2.2");
  });
  it.each([403, 429, 500])("keeps the snapshot on HTTP %s and backs off across page visits", async (status) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status }));
    expect(await fetchNexReleases(seed, { storage: localStorage, fetcher, now })).toBe(seed);
    expect(await fetchNexReleases(seed, { storage: localStorage, fetcher, now: now + 1000 })).toBe(seed);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("survives broken JSON, malicious cache data and unavailable storage", async () => {
    localStorage.setItem(NEX_RELEASE_CACHE_KEY, "broken");
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("not JSON"));
    expect(await fetchNexReleases(seed, { storage: localStorage, fetcher, now })).toBe(seed);
    const denied = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("full"); } };
    const valid = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify([fixture()])));
    expect((await fetchNexReleases(seed, { storage: denied, fetcher: valid, now }))[0].version).toBe("2.3.0");
  });
  it("ends a stalled request and leaves the page on its snapshot", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>().mockImplementation((_url, options) => new Promise((_resolve, reject) => options?.signal?.addEventListener("abort", () => reject(new Error("aborted")))));
    const result = fetchNexReleases(seed, { fetcher, now });
    await vi.advanceTimersByTimeAsync(7000);
    expect(await result).toBe(seed);
  });
});
