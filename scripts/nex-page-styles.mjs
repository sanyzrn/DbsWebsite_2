/** Route-local CSS from Vite's authoritative client manifest, before hydration. */
export function nexPageStyles(urlPath, manifest) {
  const match = urlPath.match(/^\/(?:en\/)?nex(?:\/(features|guide|changelog|download|themes|faq|privacy))?\/?$/);
  if (!match) return [];
  const source = match[1] ? `src/pages/nex/Nex${match[1][0].toUpperCase() + match[1].slice(1)}Page.tsx` : "src/pages/NexLandingPage.tsx";
  if (!manifest[source]) throw new Error(`Nex stylesheet manifest entry missing: ${source}`);
  const styles = new Set();
  const visited = new Set();
  function collect(key) {
    if (visited.has(key)) return;
    visited.add(key);
    const entry = manifest[key];
    if (!entry) throw new Error(`Missing Vite manifest dependency: ${key}`);
    for (const css of entry.css ?? []) styles.add(`/${css}`);
    for (const dependency of entry.imports ?? []) collect(dependency);
  }
  collect(source);
  if (!styles.size) throw new Error("Nex must have prerendered CSS for no-JavaScript visits");
  return [...styles];
}
