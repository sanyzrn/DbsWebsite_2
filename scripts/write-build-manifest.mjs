import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { ROOT } from './site-url.mjs';
const hash = createHash('sha256');
for (const file of (await fs.readdir(path.join(ROOT, 'content/nex'))).sort()) {
  hash.update(file + '\0'); hash.update(await fs.readFile(path.join(ROOT, 'content/nex', file)));
}
const latest = JSON.parse(await fs.readFile(path.join(ROOT, 'content/nex/latest.json'), 'utf8'));
const product = JSON.parse(await fs.readFile(path.join(ROOT, 'content/nex/product.json'), 'utf8'));
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
await fs.mkdir(path.join(ROOT, 'dist/nex'), { recursive: true });
await fs.writeFile(path.join(ROOT, 'dist/nex/build.json'), JSON.stringify({ schemaVersion: 1, commit, version: latest.releases[0].version, sourceRevision: product.sourceRevision, contentHash: hash.digest('hex') }) + '\n');
console.log('Production artifact provenance written (no credentials).');
