import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./motion";

/** Desktop — full particle budget. */
export const MAGIC_DUST_PARTICLES_DESKTOP = 6000;
/** Tablet (640–1023px). */
export const MAGIC_DUST_PARTICLES_TABLET = 2200;
/** Mobile (<640px). */
export const MAGIC_DUST_PARTICLES_MOBILE = 1200;

const RESIZE_DEBOUNCE_MS = 150;
/** Upper bound on how long the WebGL layer waits for an idle slot. */
const IDLE_TIMEOUT_MS = 2500;
/** Delay used where requestIdleCallback is unavailable (Safari, jsdom). */
const IDLE_FALLBACK_MS = 200;

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/**
 * Run `task` once the browser is idle after first paint, so fetching and compiling
 * the WebGL chunk never competes with the hero's LCP.
 */
function whenIdle(task: () => void): () => void {
  const w = window as IdleWindow;

  if (typeof w.requestIdleCallback === "function") {
    const handle = w.requestIdleCallback(task, { timeout: IDLE_TIMEOUT_MS });
    return () => w.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(task, IDLE_FALLBACK_MS);
  return () => window.clearTimeout(handle);
}

/**
 * Whether the WebGL MagicDust layer should mount at all.
 * Static `HeroAtmosphere` is always the fallback when this is false.
 */
export function computeMagicDustEnabled(): boolean {
  if (typeof window === "undefined") return false;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memory === "number" && memory < 4) return false;

  // Coarse pointer + narrow viewport ≈ lower-end phone — skip the 3D layer.
  if (window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 640) {
    return false;
  }

  return true;
}

/** Particle budget from viewport width (read on mount / debounced resize). */
export function magicDustParticleCount(width: number): number {
  if (width >= 1024) return MAGIC_DUST_PARTICLES_DESKTOP;
  if (width >= 640) return MAGIC_DUST_PARTICLES_TABLET;
  return MAGIC_DUST_PARTICLES_MOBILE;
}

/**
 * Live gate for mounting MagicDust. Evaluated in Hero *before* the lazy()
 * import runs — when false, the WebGL chunk is never requested.
 */
export function useMagicDustEnabled(): boolean {
  const reducedMotion = usePrefersReducedMotion();
  /*
   * Starts disabled on purpose:
   *  - the prerendered HTML has no WebGL layer (the gate reads browser-only APIs),
   *    so a `true` first render would be a hydration mismatch and cost the whole
   *    prerendered DOM;
   *  - it keeps the ~230 KB gzip three.js chunk off the critical path until idle.
   */
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(computeMagicDustEnabled());
    const cancelIdle = whenIdle(sync);

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(sync, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener("resize", onResize);
    const coarseMq = window.matchMedia("(pointer: coarse)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    coarseMq.addEventListener("change", sync);
    motionMq.addEventListener("change", sync);

    return () => {
      cancelIdle();
      if (timer !== undefined) clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      coarseMq.removeEventListener("change", sync);
      motionMq.removeEventListener("change", sync);
    };
  }, []);

  return enabled && !reducedMotion;
}

/** Debounced viewport → particle count for MagicDust. */
export function useMagicDustParticleCount(): number {
  const [count, setCount] = useState(() =>
    typeof window !== "undefined" ? magicDustParticleCount(window.innerWidth) : MAGIC_DUST_PARTICLES_DESKTOP
  );

  useEffect(() => {
    const sync = () => setCount(magicDustParticleCount(window.innerWidth));
    sync();

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(sync, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener("resize", onResize);
    return () => {
      if (timer !== undefined) clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return count;
}
