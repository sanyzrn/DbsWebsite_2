/** Only promote verified output built from the current main commit. */
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const artifact = JSON.parse(await fs.readFile('dist/nex/build.json', 'utf8'));
if (artifact.schemaVersion !== 1 || artifact.commit !== process.env.EXPECTED_COMMIT || !/^[a-f0-9]{64}$/.test(artifact.contentHash)) throw new Error('Artifact does not match the validated commit');
const currentMain = execFileSync('git', ['ls-remote', 'origin', 'refs/heads/main'], { encoding: 'utf8' }).split(/\s/)[0];
if (!/^[a-f0-9]{40}$/.test(currentMain)) throw new Error('Cannot verify current production branch');
const current = currentMain === artifact.commit;
console.log(`idea_deploy=${current}`);

// Idea-only commits never promote the rest of the site or its Nex files.
let ideaOnly = false;
if (process.env.SOURCE_WORKFLOW === 'CI') {
  const changed = execFileSync('git', ['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  ideaOnly = changed.length > 0 && changed.every(file => file.startsWith('public/idea/'));
}
let deploy = current && !ideaOnly;
try {
  const response = await fetch('https://dbsstudio.ir/nex/build.json', { signal: AbortSignal.timeout(10000), cache: 'no-store' });
  if (response.ok) {
    const live = await response.json();
    if (live.commit === artifact.commit && live.contentHash === artifact.contentHash) deploy = false;
    if (/^\d+\.\d+\.\d+$/.test(live.version) && /^\d+\.\d+\.\d+$/.test(artifact.version)) {
      const left = artifact.version.split('.').map(Number), right = live.version.split('.').map(Number);
      const delta = left.map((value, i) => value - right[i]).find(value => value !== 0) ?? 0;
      if (delta < 0) {
        console.error('Skipping full site deploy: artifact has an older Nex version.');
        deploy = false;
      }
    }
  }
} catch {
  console.error('Live provenance unavailable; verified artifact remains eligible.');
}
console.log(`deploy=${deploy}`);
