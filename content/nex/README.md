# Nex product snapshots

`npm run fetch:nex` refreshes public stable releases and product sources. It also runs before `npm run build`. If upstream is unavailable the build uses committed data; a missing initial snapshot is an error. `NEX_DATA_OFFLINE=1 npm run build` is deterministic and makes no upstream requests. `node scripts/fetch-nex-data.mjs --strict` fails on refresh errors for diagnostics.

- `releases.json`: all fetched stable releases, sorted semantically. Drafts/prereleases, unsafe links and malformed assets are discarded. No release HTML is injected into the page.
- `latest.json`: latest details plus seven compact archive pointers; avoids importing the entire history into the landing bundle.
- `product.json`: app version, pinned source revision, actual available module IDs and guide-image dimensions/paths.
- `guide.{fa,en}.md`, `changelog.{fa,en}.md`: upstream text, unmodified. These are data, not executable MDX.
- `theme-presets.dart`, `module-rollout.dart`: upstream source inputs for the next phase. Theme JSON generation and feature extraction are tracked in `docs/nex-website-roadmap.md`.
- Images are fetched, decoded as WebP and sized with Sharp. The current upstream guide files were visually inspected and are placeholder artwork, including identical FA/EN pairs. They are not published as screenshots. `verified-images.json` is an initially empty filename → SHA-256 approval map; only visually verified, matching hashes are copied into `public/images/nex/guide/`. `product.json` records dimensions, hashes, `verified` and a null `src` for unapproved files. The landing page uses an explicitly labelled HTML/CSS illustration until real screenshots are supplied.

Product files are fetched together from the same commit of `DbsNex/main`. Its `pubspec.yaml` version must match the newest public release; otherwise the previous product data stays. This is a version/revision guard, not proof that main equals the exact binary's source. Releases do not currently supply a source-commit association. A future publisher-provided revision can make that link exact.

Runtime refresh uses only the public releases API, anonymously. The browser validates data again, merges it with the build snapshot without downgrading, caches for 20 minutes, revalidates with ETag, stops stalled requests after seven seconds and backs off after failure. Storage denial leaves a working in-memory page. Unknown architectures use Universal; no compatible APK means the CTA links to the release page. Only `https://api.github.com` is added to `connect-src`: source files and images are fetched at build time, so no raw/blob domains need browser access yet.

## Scheduled refresh

`.github/workflows/refresh-nex.yml` runs every six hours, manually, or on `repository_dispatch` type `nex-release-published`. It checks out `cursor-dev`, refreshes data, builds changed snapshots and pushes only data/images back to that branch. A competing branch update rejects its ordinary push; it never force-pushes. Scheduled/dispatch workflows become active after the workflow exists on the repository's default branch. No main merge or production deployment happens in this phase. Production continues through the existing reviewed `cursor-dev` → `main` flow.

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
