/**
 * Switchable spot colours. Each is named after a printing ink; the CSS values
 * (light + dark) live in src/index.css under html[data-accent="…"].
 * `swatch` is the picker chip (a static class — inline style is blocked by CSP).
 */
export const ACCENTS = [
  { id: "reflex", swatch: "bg-[#3328b8] dark:bg-[#9d98f0]" },
  { id: "rhodamine", swatch: "bg-[#b3246b] dark:bg-[#ee8fc0]" },
  { id: "green", swatch: "bg-[#14744d] dark:bg-[#74cda6]" },
  { id: "warm-red", swatch: "bg-[#b0361f] dark:bg-[#f09c82]" },
  { id: "cyan", swatch: "bg-[#0b6a8c] dark:bg-[#78c4e3]" },
  { id: "graphite", swatch: "bg-[#3d4252] dark:bg-[#c3c7d5]" },
] as const;

export type AccentId = (typeof ACCENTS)[number]["id"];
export const DEFAULT_ACCENT: AccentId = "reflex";
export const ACCENT_STORAGE_KEY = "sz-accent";

export function isAccentId(value: unknown): value is AccentId {
  return ACCENTS.some((a) => a.id === value);
}

/** Reflex Blue is the base palette, so it is expressed as "no attribute". */
export function applyAccent(id: AccentId) {
  const root = document.documentElement;
  if (id === DEFAULT_ACCENT) root.removeAttribute("data-accent");
  else root.setAttribute("data-accent", id);
}
