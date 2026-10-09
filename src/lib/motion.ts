import { useSyncExternalStore } from "react";

function subscribeToReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const serverReducedMotion = () => false;

/** Live subscription to `prefers-reduced-motion: reduce`. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeToReducedMotion, prefersReducedMotion, serverReducedMotion);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

/**
 * Progressive enhancement: use the View Transitions API when available and
 * motion is allowed; otherwise run the update immediately (CSS color
 * transitions still soften the swap when motion is allowed).
 */
export function runThemeTransition(update: () => void): void {
  if (typeof document === "undefined" || prefersReducedMotion()) {
    update();
    return;
  }
  const doc = document as ViewTransitionDoc;
  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(update);
    return;
  }
  update();
}
