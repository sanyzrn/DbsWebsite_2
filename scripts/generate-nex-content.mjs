import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSiteUrl } from './site-url.mjs';
import { parseMarkdown, parseGuide, parseChangelog, parseThemePresets, contentText } from '../shared/nex-content.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const dir = path.join(root, 'content/nex');
const read = (name) => fs.readFile(path.join(dir, name), 'utf8');
const save = async (name, data) => { const text = JSON.stringify(data) + '\n'; const target = path.join(dir, name); try { if (await fs.readFile(target, 'utf8') === text) return; } catch { /* first generation */ } await fs.writeFile(target, text); };
const source = JSON.parse(await read('product.json'));
const releases = JSON.parse(await read('releases.json')).releases;
const guides = {};
for (const lang of ['fa', 'en']) { guides[lang] = parseGuide(await read(`guide.${lang}.md`)); await save(`guide.${lang}.json`, guides[lang]); await save(`privacy.${lang}.json`, parseMarkdown(await read(`privacy.${lang}.md`))); }
if (guides.fa.sections.length !== guides.en.sections.length || guides.en.sections.length !== 19) throw new Error('Guide section schema changed; review the upstream guide');
const notes = { fa: parseChangelog(await read('changelog.fa.md')), en: parseChangelog(await read('changelog.en.md')) };
const history = releases.map((release) => ({ ...release, notes: {
  fa: notes.fa.get(release.version) ?? (release.notes.fa ? parseMarkdown(release.notes.fa) : null),
  en: notes.en.get(release.version) ?? parseMarkdown(release.notes.en),
} }));
await save('history.json', { sourceRevision: source.sourceRevision, releases: history });
await save('themes.json', { sourceRevision: source.sourceRevision, themes: parseThemePresets(await read('theme-presets.dart')) });
for (const lang of ['fa', 'en']) {
  const faq = guides[lang].sections[17];
  const list = faq.blocks.find((node) => node.type === 'list');
  await save(`faq.${lang}.json`, (list?.children ?? []).map((node) => { const children = node.children?.[0]?.children ?? []; return { question: contentText(children.filter((n) => n.type === 'strong').slice(0, 1)), answer: children.slice(1) }; }));
  // Keep the feed bounded to real, public stable releases. No untrusted HTML is embedded.
  const origin = getSiteUrl();
  const url = `${origin}${lang === 'en' ? '/en' : ''}/nex/changelog`;
  const escape = (text) => Array.from(String(text)).filter((c) => c.charCodeAt(0) >= 32 || [9, 10, 13].includes(c.charCodeAt(0))).join('').replace(/\s+/g, ' ').trim().replace(/[<>&"']/g, (c) => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&apos;' })[c]);
  const items = history.map((entry) => `<item><title>Nex ${entry.version}</title><link>${url}#v${entry.version}</link><guid isPermaLink="true">${url}#v${entry.version}</guid><pubDate>${new Date(entry.publishedAt).toUTCString()}</pubDate><description>${escape(contentText(entry.notes[lang] ?? entry.notes.en))}</description></item>`).join('');
  const destination = path.join(root, 'public', lang === 'en' ? 'en/nex' : 'nex');
  await fs.mkdir(destination, { recursive: true });
  await fs.writeFile(path.join(destination, 'changelog.xml'), `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Nex — ${lang === 'fa' ? 'تغییرات نسخه‌ها' : 'Changelog'}</title><link>${url}</link><description>Nex public release history</description><language>${lang}</language>${items}</channel></rss>\n`);
}
console.log(`Nex product content: ${history.length} public releases, 19 guide chapters, ${parseThemePresets(await read('theme-presets.dart')).length} themes`);
