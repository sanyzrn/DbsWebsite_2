import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { parseMarkdown, parseChangelog, contentText } from '../../shared/nex-content.mjs';
import { mergeReleaseHistory, type HistoryRelease, type NexTheme } from '../lib/nexContent';
import { themeVariables } from '../lib/nexThemePreview';
import { resolveSeoForPath, listPrerenderPaths } from '../lib/seo';
import history from '../../content/nex/history.json';
import themes from '../../content/nex/themes.json';
import guideFa from '../../content/nex/guide.fa.json';
import guideEn from '../../content/nex/guide.en.json';
import ScreenGallery from '../components/nex/ScreenGallery';
import { NEX_SCREENS } from '../lib/nexScreens';
import IntelligenceDemo from '../components/nex/IntelligenceDemo';
import { NEX_COPY } from '../lib/nex';
afterEach(cleanup);
function luminance(hex: string) { const c = hex.slice(1).match(/../g)!.map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return c[0] * .2126 + c[1] * .7152 + c[2] * .0722; }
function contrast(a: string, b: string) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
describe('Source-backed product content', () => {
  it('removes executable HTML, unsafe links and arbitrary remote images from upstream Markdown', () => {
    const nodes = parseMarkdown('<script>alert(1)</script>\n\n[unsafe](javascript:alert) [safe](https://example.com) ![tracking](https://example.com/a.webp)\n\n![approved candidate](home.webp)');
    const json = JSON.stringify(nodes);
    expect(json).not.toContain('script'); expect(json).not.toContain('javascript:'); expect(json).not.toContain('https://example.com/a.webp');
    expect(json).toContain('https://example.com/'); expect(json).toContain('home.webp'); expect(contentText(nodes)).toContain('unsafe');
  });
  it('does not turn Unreleased, headings or prereleases into public versions', () => {
    const notes = parseChangelog('## Unreleased\n- future\n## v1.2.3\n- shipped\n## v2.0.0-beta\n- beta');
    expect([...notes.keys()]).toEqual(['1.2.3']); expect(contentText(notes.get('1.2.3')!)).toContain('shipped');
  });
  it('preserves exact downloadable assets when runtime summaries omit the archive', () => {
    const entry = history.releases[0] as HistoryRelease;
    const merged = mergeReleaseHistory([entry], [{ ...entry, assets: [], notes: { fa: null, en: 'new summary' } }]);
    expect(merged[0].assets).toEqual(entry.assets); expect(merged[0].notes).toEqual(entry.notes);
  });
  it('has matching 19-chapter guides and a stable public archive', () => {
    expect(guideFa.sections).toHaveLength(19); expect(guideEn.sections.map(s => s.id)).toEqual(guideFa.sections.map(s => s.id));
    expect(history.releases.length).toBeGreaterThan(130); expect(new Set(history.releases.map(r => r.version)).size).toBe(history.releases.length);
    expect(history.releases.every(r => /^\d+\.\d+\.\d+$/.test(r.version) && r.url.startsWith('https://github.com/'))).toBe(true);
  });
  it('keeps text and accent readable across all 14 source themes in both modes', () => {
    expect(themes.themes).toHaveLength(14);
    for (const theme of themes.themes as NexTheme[]) for (const dark of [false, true]) {
      const vars = themeVariables(theme, dark) as Record<string, string>;
      for (const token of ['--nx-ink', '--nx-muted', '--nx-blue']) for (const surface of ['--nx-bg', '--nx-card', '--nx-tint']) expect(contrast(vars[token], vars[surface])).toBeGreaterThanOrEqual(4.5);
    }
  });
  it.each(['features', 'guide', 'changelog', 'download', 'themes', 'faq', 'privacy'])('prerenders both locales with reciprocal canonical metadata: %s', slug => {
    for (const prefix of ['', '/en']) { const path = `${prefix}/nex/${slug}`; const seo = resolveSeoForPath(path); expect(listPrerenderPaths()).toContain(path); expect(seo.canonical).toBe(`https://dbsstudio.ir${path}`); expect(seo.alternateFa).toBe(`https://dbsstudio.ir/nex/${slug}`); expect(seo.alternateEn).toBe(`https://dbsstudio.ir/en/nex/${slug}`); }
  });
});
describe('Requested landing interactions', () => {
  it.each(['fa', 'en'] as const)('lists the real screens with their captions in the page language: %s', lang => {
    const { container } = render(<ScreenGallery lang={lang} />);
    const images = [...container.querySelectorAll('.nex-screen img')];
    expect(images).toHaveLength(10);
    expect(images.every(img => img.getAttribute('srcset')?.includes('-1080.webp 1080w') && img.getAttribute('loading') === 'lazy')).toBe(true);
    expect(images.slice(0, lang === 'fa' ? 7 : 3).every(img => img.getAttribute('src')!.includes(`/${lang}_`))).toBe(true);
    for (const shot of NEX_SCREENS) expect(container).toHaveTextContent(shot.text[lang]);
  });
  it('fills AI-off mode with three prepared notes and restores them after switching off', () => {
    const { container } = render(<IntelligenceDemo lang="fa" />);
    expect(container.querySelectorAll('.nex-ai-quiet-notes > div')).toHaveLength(3);
    expect(screen.getByText(NEX_COPY.fa.aiQuietText)).toBeVisible();
    fireEvent.click(screen.getByRole('switch')); expect(container.querySelectorAll('.nex-ai-connections li')).toHaveLength(3);
    fireEvent.click(screen.getByRole('switch')); expect(container.querySelectorAll('.nex-ai-quiet-notes > div')).toHaveLength(3);
  });
});
