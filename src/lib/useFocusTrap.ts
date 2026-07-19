import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function isFocusable(el: HTMLElement): boolean {
  if (el.getAttribute("aria-hidden") === "true") return false;
  if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return false;
  const style = window.getComputedStyle(el);
  if (style.visibility === "hidden" || style.display === "none") return false;
  return true;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isFocusable);
}

type FocusTrapOptions = {
  /** Extra focusable elements to include in the cycle (e.g. a menu toggle outside the panel). */
  additionalRefs?: RefObject<HTMLElement | null>[];
};

/**
 * When `active`, Tab / Shift+Tab cycle focus only among `containerRef` (+ optional extras).
 * Does not set initial focus — callers should focus the preferred element.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  options?: FocusTrapOptions
) {
  const additionalRefs = options?.additionalRefs;

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const collect = () => {
      const inside = getFocusable(container);
      const extras = (additionalRefs ?? [])
        .map((r) => r.current)
        .filter((el): el is HTMLElement => !!el && isFocusable(el) && !inside.includes(el));
      return [...inside, ...extras];
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = collect();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const current = document.activeElement as HTMLElement | null;
      const inCycle = current ? focusable.includes(current) : false;

      if (e.shiftKey) {
        if (!inCycle || current === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inCycle || current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [active, containerRef, additionalRefs]);
}
