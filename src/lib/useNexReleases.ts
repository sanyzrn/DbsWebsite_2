import { useEffect, useState } from "react";
import snapshot from "../../content/nex/latest.json";
import type { NexRelease } from "../../shared/nex-releases.mjs";
import { refreshNexReleases } from "./nexReleaseClient";

export const NEX_RELEASE_SNAPSHOT = snapshot.releases as NexRelease[];

export function useNexReleases() {
  // Snapshot on both server and first client render: no hydration replacement.
  const [releases, setReleases] = useState(NEX_RELEASE_SNAPSHOT);
  useEffect(() => {
    let active = true;
    // Wait until the first page paint; absence of GitHub never blocks reading.
    const timer = setTimeout(() => {
      void refreshNexReleases(NEX_RELEASE_SNAPSHOT).then((data) => { if (active) setReleases(data); });
    }, 1000);
    return () => { active = false; clearTimeout(timer); };
  }, []);
  return releases;
}
