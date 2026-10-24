import { fromMarkdown } from 'mdast-util-from-markdown';

const inline = new Set(['text', 'strong', 'emphasis', 'inlineCode', 'break', 'link', 'image']);
const blocks = new Set([...inline, 'paragraph', 'heading', 'list', 'listItem', 'blockquote', 'code', 'thematicBreak']);
export function safeContentUrl(value) {
  if (typeof value !== 'string' || /[\u0000-\u0020\u007f\\]/.test(value)) return null;
  if (/^#[\w\u0600-\u06ff-]+$/.test(value)) return value;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function parseMarkdown(value) {
  const clean = (node) => {
    if (!blocks.has(node.type)) return null;
    const children = node.children?.map(clean).filter(Boolean);
    if (node.type === 'link') {
      const url = safeContentUrl(node.url);
      return url ? { type: 'link', url, children } : { type: 'text', value: contentText(node.children ?? []) };
    }
    if (node.type === 'image') return /^[-a-zA-Z0-9_]+\.webp$/.test(node.url) ? { type: 'image', url: node.url, alt: node.alt || '' } : null;
    return { type: node.type, ...(node.value !== undefined ? { value: node.value } : {}), ...(children ? { children } : {}), ...(node.depth ? { depth: node.depth } : {}), ...(node.type === 'list' ? { ordered: !!node.ordered, start: node.start || 1 } : {}) };
  };
  return fromMarkdown(value).children.map(clean).filter(Boolean);
}
export function contentText(nodes) {
  return nodes.map((node) => node.value ?? (node.type === 'image' ? node.alt : contentText(node.children ?? []))).join(' ');
}
export function parseGuide(text) {
  const all = parseMarkdown(text), sections = [], intro = [];
  let current = null;
  for (const node of all) {
    if (node.type === 'heading' && node.depth === 1) continue;
    if (node.type === 'heading' && node.depth === 2) {
      current = { id: `guide-${String(sections.length + 1).padStart(2, '0')}`, title: contentText(node.children), blocks: [] };
      sections.push(current);
    } else (current ? current.blocks : intro).push(node);
  }
  return { intro, sections: sections.map((section) => ({ ...section, text: contentText(section.blocks) })) };
}
export function parseChangelog(text) {
  const sections = new Map();
  const headings = [...text.matchAll(/^##\s+(.+)\s*$/gm)];
  headings.forEach((heading, i) => {
    const version = heading[1].trim().match(/^v?(\d+\.\d+\.\d+)$/)?.[1];
    if (version) sections.set(version, parseMarkdown(text.slice(heading.index + heading[0].length, headings[i + 1]?.index ?? text.length).trim()));
  });
  return sections;
}
export function parseThemePresets(dart) {
  const textures = new Map([...dart.matchAll(/'([a-z]+)'\s*=>\s*NexThemeTexture\.(\w+)/g)].map((m) => [m[1], m[2]]));
  const presets = [...dart.matchAll(/\(\s*id:\s*'([a-z]+)',([\s\S]*?)\n\s*\),/g)].map((match) => {
    const body = match[2];
    const string = (name) => body.match(new RegExp(`${name}: '((?:\\\\.|[^'])*)'`))?.[1].replace(/\\'/g, "'");
    const color = (name) => { const value = body.match(new RegExp(`${name}: (?:Color\\(0xFF([A-Fa-f0-9]{6})\\)|null)`)); if (!value) throw new Error(`Missing theme color ${name}`); return value[1] ? `#${value[1].toLowerCase()}` : null; };
    const theme = { id: match[1], name: { fa: string('fa'), en: string('en') }, description: { fa: string('faDescription'), en: string('enDescription') }, seed: color('seed'), light: color('light'), dark: color('dark'), texture: textures.get(match[1]) ?? 'none' };
    if (!theme.name.fa || !theme.name.en || !theme.description.fa || !theme.description.en || !theme.seed) throw new Error('Incomplete theme source');
    return theme;
  });
  if (!presets.length || new Set(presets.map((t) => t.id)).size !== presets.length) throw new Error('Invalid Dart theme source');
  return presets;
}
