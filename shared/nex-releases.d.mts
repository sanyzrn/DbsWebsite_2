export interface NexAsset {
  name: string;
  url: string;
  kind: "universal" | "arm64" | "arm32" | "x64" | "bundle" | "other";
  size: number;
  downloads: number;
  sha256: string | null;
}
export interface NexRelease {
  version: string;
  tag: string;
  url: string;
  publishedAt: string;
  notes: { en: string; fa: string | null };
  assets: NexAsset[];
}
export const NEX_RELEASES_URL: string;
export const NEX_RELEASES_API: string;
export function compareVersions(a: string, b: string): number;
export function safeReleaseUrl(value: unknown, asset?: boolean): string | null;
export function assetKind(name: string): NexAsset["kind"];
export function releaseNotes(body: string): NexRelease["notes"];
export function normalizeReleases(payload: unknown): NexRelease[];
export function selectApk(assets: NexAsset[], hint?: string): NexAsset | null;
