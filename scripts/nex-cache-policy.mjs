/** Only anonymous, public Nex release-list responses belong in runtime cache. */
export const NEX_RUNTIME_CACHE = { name: 'nex-public-releases-v1', maxEntries: 3, maxAgeSeconds: 20 * 60 };
export function isPublicNexReleaseRequest({ url, request }) {
  return request.method === 'GET' && request.credentials === 'omit' && !request.headers.has('Authorization') &&
    url.origin === 'https://api.github.com' && url.pathname === '/repos/sanyzrn/DbsNex-releases/releases' &&
    [...url.searchParams.keys()].every((key) => ['per_page', 'page'].includes(key)) &&
    (!url.searchParams.has('page') || url.searchParams.get('page') === '1');
}
