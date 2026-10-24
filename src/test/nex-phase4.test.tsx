import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { isPublicNexReleaseRequest } from '../../scripts/nex-cache-policy.mjs';
import { resolveSeoForPath } from '../lib/seo';
import { parseMarkdown } from '../../shared/nex-content.mjs';
import { renderToStaticMarkup } from 'react-dom/server';
import { ContentBlocks } from '../components/nex/ContentBlocks';
import GuidePaths from '../components/nex/GuidePaths';
import { NEX_COPY } from '../lib/nex';
function cacheable(url: string, init: RequestInit = {}) { const request = new Request(url, { credentials:'omit', ...init }); return isPublicNexReleaseRequest({url:new URL(url), request}); }
describe('Public-only worker caching', () => {
  const url='https://api.github.com/repos/sanyzrn/DbsNex-releases/releases?per_page=100';
  it('caches the anonymous release list, never credentials, other repos, assets or writes', () => {
    expect(cacheable(url)).toBe(true);
    for (const other of [url+'&page=2',url+'&token=secret',url.replace('DbsNex-releases','Other'),url.replace('/releases?','/releases/download?'),url.replace('api.github.com','github.com')]) expect(cacheable(other)).toBe(false);
    expect(cacheable(url,{headers:{Authorization:'Bearer placeholder'}})).toBe(false);
    expect(cacheable(url,{credentials:'include'})).toBe(false); expect(cacheable(url,{method:'POST'})).toBe(false);
  });
});
describe('Page-specific share and FAQ semantics', () => {
  it.each(['fa','en'])('uses local 1200x630 card destinations and source FAQ answers: %s', lang => {
    const prefix=lang==='fa'?'':'/en'; const faq=resolveSeoForPath(`${prefix}/nex/faq`); const guide=resolveSeoForPath(`${prefix}/nex/guide`);
    expect(faq.image).not.toBe(guide.image); expect(faq.image).toContain(`/share/${lang}/faq.jpg`);
    const graph=faq.jsonLd[0]['@graph'] as Record<string,unknown>[]; const questions=graph.find(n=>n['@type']==='FAQPage')?.mainEntity as unknown[];
    expect(questions).toHaveLength(11); expect(guide.jsonLd[0]).not.toHaveProperty('FAQPage');
    expect(JSON.stringify(graph)).not.toContain('aggregateRating');
  });
  it('renders image paragraphs as valid block content rather than nested paragraphs', () => {
    const html=renderToStaticMarkup(<ContentBlocks lang="en" nodes={parseMarkdown('![Home](home.webp)')} />);
    expect(html).toContain('class="nex-content-paragraph"'); expect(html).not.toContain('<p><p');
  });
  it.each(['fa','en'] as const)('has four native, no-JS short paths to real chapters: %s', lang => {
    const html=renderToStaticMarkup(<GuidePaths lang={lang}/>); expect(html).toContain(NEX_COPY[lang].quickTitle);
    expect((html.match(/<details/g)||[])).toHaveLength(4); expect((html.match(/href="#guide-\d{2}"/g)||[])).toHaveLength(12);
  });
});
describe('Deployment uses reviewed artifacts', () => {
  it('never rebuilds in the credentialled deploy workflow, and keeps FTPS isolation', () => {
    const deploy=fs.readFileSync('.github/workflows/deploy.yml','utf8');
    expect(deploy).toContain('actions/download-artifact@v8'); expect(deploy).toContain('run-id: ${{ github.event.workflow_run.id }}');
    expect(deploy).not.toMatch(/run: npm run build/); expect(deploy).toContain('head_repository.full_name == github.repository');
    expect(deploy).toContain('dangerous-clean-slate: false'); expect(deploy).toContain('state-name: .dbswebsite-2-sync-state.json');
    const refresh=fs.readFileSync('.github/workflows/refresh-nex-production.yml','utf8'); expect(refresh).toContain("github.ref == 'refs/heads/main'"); expect(refresh).not.toContain('git push');
  });
});
