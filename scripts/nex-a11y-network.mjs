import { NEX_RELEASES_API } from '../shared/nex-releases.mjs';

/** Layout/hydration checks use the build's releases, independent of GitHub quotas.
 * Network/cache/fallback behavior is covered separately by nex-releases.test.ts.
 */
export async function installNexA11yNetwork(context, releases) {
  const payload = releases.slice(0, 100).map((release) => ({
    draft: false, prerelease: false, tag_name: release.tag,
    html_url: release.url, published_at: release.publishedAt,
    body: `${release.notes.en ?? ''}<!-- nex:fa -->${release.notes.fa ?? ''}`,
    assets: release.assets.map((asset) => ({
      name: asset.name, browser_download_url: asset.url, size: asset.size,
      download_count: asset.downloads, digest: asset.sha256 ? `sha256:${asset.sha256}` : null,
    })),
  }));
  await context.route(NEX_RELEASES_API, (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*', etag: '"nex-a11y-snapshot"' },
    body: JSON.stringify(payload),
  }));
}
