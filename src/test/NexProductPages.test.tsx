import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App, { AppShell } from '../App';
import { StaticRouter } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { NEX_COPY } from '../lib/nex';
import { NEX_PAGE_SLUGS } from '../lib/nexContent';
function open(path: string) { window.history.replaceState(null, '', path); return render(<App />); }
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); localStorage.clear(); });
describe('Independent bilingual Nex pages', () => {
  it.each(NEX_PAGE_SLUGS.slice(1))('renders readable server content and the correct locale links: %s', slug => {
    for (const lang of ['fa', 'en'] as const) {
      const path = `${lang === 'en' ? '/en' : ''}/nex/${slug}`;
      const html = renderToString(<StaticRouter location={path}><AppShell /></StaticRouter>);
      expect(html).toContain(NEX_COPY[lang].productTitles[NEX_PAGE_SLUGS.indexOf(slug)]);
      expect(html).toContain(`href="${lang === 'fa' ? '/en' : ''}/nex/${slug}"`);
      expect(html).not.toContain('class="nav-bar'); expect(html).not.toContain('class="intro"');
    }
  });
  it('filters guide chapters with Persian variants and keeps original chapter IDs', () => {
    const { container } = open('/nex/guide'); expect(container.querySelectorAll('[data-guide-chapter]')).toHaveLength(19);
    fireEvent.change(screen.getByLabelText(NEX_COPY.fa.guideSearch), { target: { value: 'يادداشت' } });
    expect(container.querySelectorAll('[data-guide-chapter]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-guide-chapter]').length).toBeLessThan(19);
    expect(container.querySelector('img[src*="/guide/"]')).toBeNull();
  });
  it('opens a deep release permalink on another archive page', () => {
    const { container } = open('/en/nex/changelog#v0.6.0');
    const entry = container.querySelector('details[id="v0.6.0"]'); expect(entry).toHaveAttribute('open');
    expect(container.querySelectorAll('.nex-history-entry').length).toBeLessThanOrEqual(10);
    fireEvent.change(screen.getByLabelText(NEX_COPY.en.historySearch), { target: { value: '2.2.2' } });
    expect(container.querySelectorAll('.nex-history-entry')).toHaveLength(1);
  });
  it('tries a mood across Nex navigation and clears it when leaving the product', () => {
    const { container } = open('/en/nex/themes');
    fireEvent.click(screen.getAllByRole('button', { name: NEX_COPY.en.themeTry })[1]);
    expect(container.querySelector('.nex-page')?.getAttribute('style')).toContain('--nx-bg: #f5eedc');
    fireEvent.click(screen.getByRole('link', { name: NEX_COPY.en.productPages[1] }));
    expect(container.querySelector('.nex-page')?.getAttribute('style')).toContain('--nx-bg: #f5eedc');
    fireEvent.click(screen.getByRole('link', { name: NEX_COPY.en.productMadeBy }));
    expect(container.querySelector('.nex-page')).toBeNull();
    expect(document.documentElement.style.getPropertyValue('--nx-bg')).toBe('');
  });
});
