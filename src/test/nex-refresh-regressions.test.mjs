import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseThemePresets } from '../../shared/nex-content.mjs';
import { installNexA11yNetwork } from '../../scripts/nex-a11y-network.mjs';
import { normalizeReleases, NEX_RELEASES_API } from '../../shared/nex-releases.mjs';

const preset = (light, dark) => `(
  id: 'still',
  en: 'Still', fa: 'سکون',
  enDescription: 'Quiet', faDescription: 'آرام',
  seed: Color(0xFF486553),
  light: ${light},
  dark: ${dark},
),`;

describe('Nex theme source compatibility', () => {
  it('preserves legacy literal colors and classic null surfaces', () => {
    expect(parseThemePresets(preset('Color(0xFFFAFAF6)', 'null'))[0]).toMatchObject({ light: '#fafaf6', dark: null });
  });
  it('resolves light/dark ramps from separate source parts without mixing their page colors', () => {
    const ramps = `const _stillLight = NexSurfaceRamp(page: Color(0xFFFAFAF6), card: Color(0xFFF0F1EA));
      const _stillDark = NexSurfaceRamp(page: Color(0xFF161A17), card: Color(0xFF1F2521));`;
    expect(parseThemePresets(preset('_stillLight', '_stillDark'), ramps)[0]).toMatchObject({ light: '#fafaf6', dark: '#161a17' });
  });
  it('rejects unresolved or malformed ramps instead of publishing invented colors', () => {
    expect(() => parseThemePresets(preset('_stillLight', 'null'))).toThrow('Missing theme ramp _stillLight');
    expect(() => parseThemePresets(preset('_stillLight', 'null'), 'const _stillLight = NexSurfaceRamp(card: Color(0xFFFAFAF6));')).toThrow('Missing page color');
  });
});

// Execute the actual workflow script against API responses for both cadence paths.
const workflow = fs.readFileSync('.github/workflows/deploy.yml', 'utf8');
const script = workflow.split('          script: |\n')[1].split('\n  deploy:')[0].split('\n').map(line => line.replace(/^ {12}/, '')).join('\n');
async function gate(jobs, artifacts = []) {
  const outputs = {};
  await new (Object.getPrototypeOf(async () => {}).constructor)('github', 'context', 'core', script)(
    { paginate: async () => jobs, rest: { actions: { listJobsForWorkflowRun() {}, listWorkflowRunArtifacts: async () => ({ data: { artifacts } }) } } },
    { repo: { owner: 'owner', repo: 'repo' }, payload: { workflow_run: { id: 1, name: 'Refresh Nex production' } } },
    { info() {}, setOutput: (name, value) => { outputs[name] = value; } },
  );
  return outputs.deploy;
}
describe('Production refresh promotion', () => {
  it('skips days where verification was intentionally not due', async () => {
    expect(await gate([{ name: 'cadence', conclusion: 'success' }, { name: 'verify', conclusion: 'skipped' }])).toBe('false');
  });
  it('allows a verified refresh with its exact retained artifact', async () => {
    expect(await gate([{ name: 'verify / build', conclusion: 'success' }], [{ name: 'verified-site', expired: false }])).toBe('true');
  });
  it('still fails if a real build loses its artifact or it expired', async () => {
    for (const artifacts of [[], [{ name: 'verified-site', expired: true }]]) {
      await expect(gate([{ name: 'verify / build', conclusion: 'success' }], artifacts)).rejects.toThrow('missing its verified-site');
    }
  });
});

it('uses valid snapshot releases for browser checks, without a live GitHub request', async () => {
  const releases = JSON.parse(fs.readFileSync('content/nex/releases.json', 'utf8')).releases;
  let response;
  await installNexA11yNetwork({ route: async (url, handler) => {
    expect(url).toBe(NEX_RELEASES_API);
    await handler({ fulfill: async (value) => { response = value; } });
  } }, releases);
  expect(response.status).toBe(200);
  expect(normalizeReleases(JSON.parse(response.body))).toEqual(releases.slice(0, 100));
});
