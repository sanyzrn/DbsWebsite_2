/** Route-local CSS from Vite's authoritative client manifest, before hydration. */
export function nexPageStyles(urlPath, manifest) {
  if (!/^\/(?:en\/)?nex\/?$/.test(urlPath)) return [];
  const source = "src/pages/NexLandingPage.tsx";
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
