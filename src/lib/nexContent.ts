import type { ContentNode } from '../../shared/nex-content.mjs';
import type { NexRelease } from '../../shared/nex-releases.mjs';
export type { ContentNode, GuideSection, NexTheme } from '../../shared/nex-content.mjs';
export type HistoryRelease = Omit<NexRelease, 'notes'> & { notes: { fa: ContentNode[] | null; en: ContentNode[] } };
export const NEX_PAGE_SLUGS = ['', 'features', 'guide', 'changelog', 'download', 'themes', 'faq', 'privacy'] as const;
export function nexPath(lang: 'fa' | 'en', page = '') { return `${lang === 'en' ? '/en' : ''}/nex${page ? `/${page}` : ''}`; }
export function nodeText(nodes: ContentNode[]): string { return nodes.map((n) => n.value ?? (n.type === 'image' ? n.alt : nodeText(n.children ?? []))).join(' '); }
export function safeContentHref(value: string | undefined) {
  if (!value || Array.from(value).some((char) => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127 || char === '\\')) return null;
  if (/^#[\w\u0600-\u06ff-]+$/.test(value)) return value;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function localeNumber(value: number, lang: 'fa' | 'en') { return new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(value); }
export function publicReleaseDate(date: string, lang: 'fa' | 'en') { return new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(date)); }
export function releaseNodes(text: string): ContentNode[] {
  // Runtime-only GitHub fallback. React escapes every string, including any HTML.
  return text.split(/\n+/).map((line) => ({ type: 'paragraph', children: [{ type: 'text', value: line.replace(/^[-*]\s+/, '') }] }));
}
export function mergeReleaseHistory(saved: HistoryRelease[], fresh: NexRelease[]) {
  const byVersion = new Map(saved.map((entry) => [entry.version, entry]));
  for (const release of fresh) {
    const existing = byVersion.get(release.version);
    byVersion.set(release.version, { ...release, assets: release.assets.length ? release.assets : existing?.assets ?? [], notes: existing?.notes ?? { fa: release.notes.fa ? releaseNodes(release.notes.fa) : null, en: releaseNodes(release.notes.en) } });
  }
  const compare = (a: string, b: string) => { const left = a.split('.').map(Number), right = b.split('.').map(Number); for (let i = 0; i < 3; i++) if (left[i] !== right[i]) return right[i] - left[i]; return 0; };
  return [...byVersion.values()].sort((a, b) => compare(a.version, b.version));
}

export function changeCount(nodes: ContentNode[]): number { return nodes.reduce((count, node) => count + (node.type === "list" ? (node.children?.length ?? 0) : node.children ? changeCount(node.children) : 0), 0); }
