import { compareVersions, NEX_RELEASES_API, normalizeReleases, type NexRelease } from "../../shared/nex-releases.mjs";

export const NEX_RELEASE_CACHE_KEY = "nex-releases-v1";
export const NEX_RELEASE_TTL = 20 * 60 * 1000;
type Cache = { checkedAt: number; etag: string | null; payload: unknown[] };
type StorageLike = Pick<Storage, "getItem" | "setItem">;
let inFlight: Promise<NexRelease[]> | undefined;

function readCache(storage: StorageLike | undefined, now: number): Cache | null {
  try {
    const cached = JSON.parse(storage?.getItem(NEX_RELEASE_CACHE_KEY) || "null");
    if (!cached || !Number.isFinite(cached.checkedAt) || cached.checkedAt > now || !Array.isArray(cached.payload) || cached.payload.length > 100) return null;
    if (!normalizeReleases(cached.payload).length) return null;
    return { checkedAt: cached.checkedAt, etag: typeof cached.etag === "string" ? cached.etag : null, payload: cached.payload };
  } catch { return null; }
}
function writeCache(storage: StorageLike | undefined, cache: Cache) {
  try { storage?.setItem(NEX_RELEASE_CACHE_KEY, JSON.stringify(cache)); } catch { /* denied or full storage */ }
}
function preferFresh(snapshot: NexRelease[], cached: NexRelease[]) {
  if (!cached.length || compareVersions(cached[0].version, snapshot[0].version) < 0) return snapshot;
  const seen = new Set(cached.map((r) => r.version));
  return [...cached, ...snapshot.filter((r) => !seen.has(r.version))].sort((a, b) => compareVersions(b.version, a.version));
}

/** Exported for deterministic cache/network tests; the UI uses the deduplicated wrapper. */
export async function fetchNexReleases(snapshot: NexRelease[], options: { storage?: StorageLike; fetcher?: typeof fetch; now?: number } = {}): Promise<NexRelease[]> {
  const { storage, fetcher = fetch, now = Date.now() } = options;
  const cache = readCache(storage, now);
  const fallback = cache ? preferFresh(snapshot, normalizeReleases(cache.payload)) : snapshot;
  if (cache && now - cache.checkedAt < NEX_RELEASE_TTL) return fallback;
  try {
    const retryAt = Number(storage?.getItem(`${NEX_RELEASE_CACHE_KEY}-retry`));
    if (retryAt > now && retryAt <= now + NEX_RELEASE_TTL) return fallback;
  } catch { /* unavailable storage */ }
  function backoff() {
    try { storage?.setItem(`${NEX_RELEASE_CACHE_KEY}-retry`, String(now + NEX_RELEASE_TTL)); } catch { /* unavailable storage */ }
    return fallback;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
    if (cache?.etag) headers["If-None-Match"] = cache.etag;
    const response = await fetcher(NEX_RELEASES_API, { headers, signal: controller.signal, credentials: "omit", cache: "no-store" });
    if (response.status === 304 && cache) {
      writeCache(storage, { ...cache, checkedAt: now });
      return fallback;
    }
    if (!response.ok) return backoff();
    const payload: unknown = await response.json();
    const releases = normalizeReleases(payload);
    if (!releases.length || !Array.isArray(payload) || payload.length > 100) return backoff();
    writeCache(storage, { checkedAt: now, etag: response.headers.get("ETag"), payload });
    return preferFresh(snapshot, releases);
  } catch { return backoff(); }
  finally { clearTimeout(timer); }
}

export function refreshNexReleases(snapshot: NexRelease[]) {
  if (inFlight) return inFlight;
  let storage: Storage | undefined;
  try { storage = window.localStorage; } catch { /* private browsing */ }
  inFlight = fetchNexReleases(snapshot, { storage }).finally(() => { inFlight = undefined; });
  return inFlight;
}
