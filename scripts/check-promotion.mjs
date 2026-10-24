/** Read-only gate: a deployment may only use verified, current-main output. */
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const artifact = JSON.parse(await fs.readFile('dist/nex/build.json', 'utf8'));
if (artifact.schemaVersion !== 1 || artifact.commit !== process.env.EXPECTED_COMMIT || !/^[a-f0-9]{64}$/.test(artifact.contentHash)) throw new Error('Artifact does not match the validated commit');
const currentMain = execFileSync('git', ['ls-remote', 'origin', 'refs/heads/main'], { encoding: 'utf8' }).split(/\s/)[0];
if (!/^[a-f0-9]{40}$/.test(currentMain)) throw new Error('Cannot verify current production branch');
let deploy = currentMain === artifact.commit;
try {
  const response = await fetch('https://dbsstudio.ir/nex/build.json', { signal: AbortSignal.timeout(10000), cache: 'no-store' });
  if (response.ok) {
    const live = await response.json();
    if (live.commit === artifact.commit && live.contentHash === artifact.contentHash) deploy = false;
    if (/^\d+\.\d+\.\d+$/.test(live.version)) {
      const left = artifact.version.split('.').map(Number), right = live.version.split('.').map(Number);
      const delta = left.map((value, i) => value - right[i]).find((value) => value !== 0) ?? 0;
      if (delta < 0) throw new Error('Refusing to deploy an older public Nex version');
    }
  }
} catch (error) {
  if (error.message === 'Refusing to deploy an older public Nex version') throw error;
  // A missing provenance file on an older deployment must not block its upgrade.
  console.error('Live provenance unavailable; verified artifact remains eligible.');
}
console.log(`deploy=${deploy}`);
