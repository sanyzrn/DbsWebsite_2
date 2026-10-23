import notes from "../../content/nex/search-demo.json";
import type { Lang } from "./i18n";
import { normalizeNexDemo } from "./nexExperience";

export const NEX_DEMO_NOTES = notes;
const index = {
  fa: notes.map((note) => ({ note, folded: normalizeNexDemo(`${note.fa} ${note.tag.fa}`) })),
  en: notes.map((note) => ({ note, folded: normalizeNexDemo(`${note.en} ${note.tag.en}`) })),
};
export function searchDemoNotes(query: string, lang: Lang) {
  const terms = query.trim().split(/[\s\u200c]+/).map(normalizeNexDemo).filter(Boolean);
  return index[lang].filter(({ folded }) => terms.every((term) => folded.includes(term))).map(({ note }) => note);
}

/** Map folded matches back to original UTF-16 offsets, preserving the displayed script. */
export function highlightRanges(text: string, query: string): [number, number][] {
  let folded = "";
  const map: { start: number; end: number }[] = [];
  let offset = 0;
  for (const char of text) {
    const normalized = normalizeNexDemo(char);
    folded += normalized;
    for (let i = 0; i < normalized.length; i++) map.push({ start: offset, end: offset + char.length });
    offset += char.length;
  }
  const ranges: [number, number][] = [];
  for (const term of query.trim().split(/[\s\u200c]+/).map(normalizeNexDemo).filter(Boolean)) {
    let from = 0;
    let match = folded.indexOf(term, from);
    while (match !== -1) {
      ranges.push([map[match].start, map[match + term.length - 1].end]);
      from = match + term.length;
      match = folded.indexOf(term, from);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [start, end] of ranges) {
    const previous = merged[merged.length - 1];
    if (previous && start <= previous[1]) previous[1] = Math.max(previous[1], end);
    else merged.push([start, end]);
  }
  return merged;
}
