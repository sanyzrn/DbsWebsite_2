import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
/** Run before prerender removes private Vite build metadata. */
export function assertNexLandingBudget(dist, manifest) {
  const seen = new Set();
  function visit(key) { if (seen.has(key)) return; seen.add(key); for (const dependency of manifest[key]?.imports ?? []) visit(dependency); }
  visit('src/pages/NexLandingPage.tsx');
  if ([...seen].some((key) => /Nex(?:Guide|Changelog|Themes)Page/.test(key))) throw new Error('Heavy Nex routes became eager landing imports');
  const bytes = [...seen].reduce((sum,key) => sum + (manifest[key]?.file.endsWith('.js') ? gzipSync(fs.readFileSync(path.join(dist,manifest[key].file)),{level:9}).length : 0),0);
  if (bytes > 190 * 1024) throw new Error(`Nex landing dependency graph exceeds 190 KiB gzip: ${bytes}`);
  console.log(`Nex landing graph ${(bytes/1024).toFixed(1)}/190 KiB gzip — guide/archive/themes stay lazy`);
}
