# Nex product snapshots

`npm run fetch:nex` refreshes public stable releases and product sources. It also runs before `npm run build`. If upstream is unavailable the build uses committed data; a missing initial snapshot is an error. `NEX_DATA_OFFLINE=1 npm run build` is deterministic and makes no upstream requests. `node scripts/fetch-nex-data.mjs --strict` fails on refresh errors for diagnostics.

- `releases.json`: all fetched stable releases, sorted semantically. Drafts/prereleases, unsafe links and malformed assets are discarded. No release HTML is injected into the page.
- `latest.json`: latest details plus seven compact archive pointers; avoids importing the entire history into the landing bundle.
- `product.json`: app version, pinned source revision, actual available module IDs and guide-image dimensions/paths.
- `guide.{fa,en}.md`, `changelog.{fa,en}.md`: upstream text, unmodified. These are data, not executable MDX.
- `theme-presets.dart`, `module-rollout.dart`: pinned upstream source inputs. `generate:nex` extracts 14 theme presets; feature module status reads product availability.
- Images are fetched, decoded as WebP and sized with Sharp. The current upstream guide files were visually inspected and are placeholder artwork, including identical FA/EN pairs. They are not published as screenshots. `verified-images.json` is an initially empty filename → SHA-256 approval map; only visually verified, matching hashes are copied into `public/images/nex/guide/`. `product.json` records dimensions, hashes, `verified` and a null `src` for unapproved files. The landing page uses an explicitly labelled HTML/CSS illustration until real screenshots are supplied.

`npm run generate:nex` converts the pinned Markdown to an allowlisted JSON AST (`guide`, `privacy`, `faq`) and combines public releases with matching changelog sections in `history.json`. It never compiles source Markdown as executable MDX. HTML, unsafe links and arbitrary remote image URLs are removed; local guide image candidates still require visual/hash approval at render time. Guide chapter parity is guarded. `themes.json` is generated from the Dart presets. `features.json` is curated bilingual editorial data; module status is resolved against product metadata rather than asserting planned modules are available. RSS under `public/{en/,}nex/changelog.xml` contains only actual public releases and escaped plain text.

Product files are fetched together from the same commit of `DbsNex/main`. Its `pubspec.yaml` version must match the newest public release; otherwise the previous product data stays. This is a version/revision guard, not proof that main equals the exact binary's source. Releases do not currently supply a source-commit association. A future publisher-provided revision can make that link exact.

Runtime refresh uses only the public releases API, anonymously. The browser validates data again, merges it with the build snapshot without downgrading, caches for 20 minutes, revalidates with ETag, stops stalled requests after seven seconds and backs off after failure. Storage denial leaves a working in-memory page. Unknown architectures use Universal; no compatible APK means the CTA links to the release page. Only `https://api.github.com` is added to `connect-src`: source files and images are fetched at build time, so no raw/blob domains need browser access yet.

## Scheduled refresh

`.github/workflows/refresh-nex.yml` runs every six hours, manually, or on `repository_dispatch` type `nex-release-published`. It checks out `cursor-dev`, refreshes data, builds changed snapshots and pushes only data/images back to that branch. A competing branch update rejects its ordinary push; it never force-pushes. Scheduled/dispatch workflows become active after the workflow exists on the repository's default branch. This workflow never merges or deploys development code. Production code still changes only through the reviewed `cursor-dev` → `main` flow.

Public sources need no secret. If app sources become private, optionally add build-only `NEX_SOURCE_TOKEN` with read access to `sanyzrn/DbsNex`. Never use a `VITE_` variable for credentials. Private-source materialization needs review if raw-file authentication changes; releases still work without it.

## Optional publisher dispatch (documentation only)

The release workflow publishes into a separate repository using an API token, so a `release: published` workflow in the releases repo may not be triggered by every publishing setup. The reliable hook is a final step in the existing **DbsNex release publishing job**, after all assets are uploaded. This phase changes neither source nor releases repository.

When explicitly requested, add a final step with a fine-grained secret `WEBSITE_DISPATCH_TOKEN` scoped to `sanyzrn/DbsWebsite_2` (Contents: write, required by GitHub's repository dispatch endpoint):

```yaml
- name: Refresh Nex website snapshot
  env:
    GH_TOKEN: ${{ secrets.WEBSITE_DISPATCH_TOKEN }}
  run: >-
    gh api --method POST repos/sanyzrn/DbsWebsite_2/dispatches
    -f event_type=nex-release-published
```

Alternatively place the same step in a tiny `workflow_dispatch` / `release: { types: [published] }` workflow in `DbsNex-releases` if that release event is known to fire in the publishing setup. Six-hour polling remains the fallback. Token creation and the cross-repo hook are owner setup; no secret is committed here.

## Production refresh and exact verified output (Phase 4)

After these workflows reach `main`, `refresh-nex-production.yml` runs every six hours (UTC 00:47/06:47/12:47/18:47), on manual dispatch or the existing `nex-release-published` repository dispatch. It checks the same reviewed `main` code through the reusable CI workflow, refreshes only public product data, runs TypeScript, lint, tests, build, dist, browser accessibility/offline and PWA/bundle gates, and retains a `verified-site` artifact. It makes no commits or automatic branch merges. The development snapshot workflow continues independently at minute 23.

The existing FTPS deployment now downloads the exact artifact from the successful main verification run, including hidden Apache rules. It does not fetch data or rebuild again after validation. Its read-only promotion gate checks the expected commit, rejects stale main code or a lower public app version, and skips FTP when both the live commit and content fingerprint match. The public `/nex/build.json` contains only commit/version/source revision/content hash; no credentials. Bale configuration is still generated only on the deployment runner, after validation, and is never uploaded as an artifact. FTP target, per-site sync state and `dangerous-clean-slate: false` remain unchanged.

The service worker is now bundled before manifest injection: `injectManifest` alone does not resolve bare Workbox imports. All product HTML and code needed to read/search offline stay revisioned in precache. Explicit extensionless-route lookup and `matchPrecache` handle Apache URLs and revisioned offline/404 fallbacks. Remote GitHub responses never enter precache. Only anonymous GETs to the exact public release-list API use a bounded stale-while-revalidate runtime cache (3 entries, 20 minutes, successful 200 responses); authenticated requests, other repositories and downloads are excluded. Existing localStorage validation/fallback remains authoritative for the UI.

`check:pwa` defaults to direct artifact checks, so it requires no local HTTP server; pass an origin to check live files. Browser registration, native story touch/mouse input, mobile contents and offline FA/EN guide search are checked by `check:a11y` in CI. CI retains `nex-visual-review` screenshots at 320/1440px, light/dark, for the Nex layouts. Heavy guide/history/theme pages remain separate route chunks; their background PWA precache is intentional for complete offline reading. Share cards are not eagerly precached.
