import { useEffect, useState } from "react";

const TYPE_MS = 60;
const ERASE_MS = 30;
const HOLD_MS = 1600;

/**
 * Cycles through `words` with a type / hold / erase loop.
 * First paint and reduced-motion: always `words[0]` (never blank).
 */
export function useTypewriter(words: string[]): string {
  const first = words[0] ?? "";
  const [text, setText] = useState(first);

  useEffect(() => {
    const start = words[0] ?? "";
    setText(start);

    if (words.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cancelled = false;
    let wordIndex = 0;
    let charIndex = start.length;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const later = (fn: () => void, ms: number) => {
      timer = setTimeout(fn, ms);
    };

    const erase = () => {
      if (cancelled) return;
      const word = words[wordIndex] ?? "";
      if (charIndex > 0) {
        charIndex -= 1;
        setText(word.slice(0, charIndex));
        later(erase, ERASE_MS);
        return;
      }
      wordIndex = (wordIndex + 1) % words.length;
      later(type, TYPE_MS);
    };

    const type = () => {
      if (cancelled) return;
      const word = words[wordIndex] ?? "";
      if (charIndex < word.length) {
        charIndex += 1;
        setText(word.slice(0, charIndex));
        later(type, TYPE_MS);
        return;
      }
      later(erase, HOLD_MS);
    };

    // Already showing words[0] fully — hold, then erase into the next phrase.
    later(erase, HOLD_MS);

    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [words]);

  return text;
}
