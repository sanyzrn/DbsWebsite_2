import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { usePrefersReducedMotion } from "../lib/motion";
import { cn } from "../utils/cn";

/**
 * Enter animation for routed page content. Keyed by pathname so language
 * switches (locale-prefixed URLs) get the same fade as ordinary navigation.
 * Persistent chrome (Nav / Footer / FQN) stays outside this wrapper.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div
      key={pathname}
      className={cn(!reduceMotion && "page-enter")}
      data-page-transition={reduceMotion ? "off" : "on"}
      data-pathname={pathname}
    >
      {children}
    </div>
  );
}
