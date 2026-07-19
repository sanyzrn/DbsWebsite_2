import { useLayoutEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { readStoredLang } from "../lib/app";

/**
 * First page-load only: if the visitor arrives at `/` with a stored English
 * preference (`sz-lang=en`), replace once to `/en`.
 *
 * This component stays mounted for the whole SPA session (AppShell). A useRef
 * marks the preference check as consumed on the first layout pass — whether or
 * not a redirect fires — so later in-app navigations back to `/` (including an
 * explicit English → Persian language switch) cannot re-trigger it.
 *
 * Short-lived state only arms `<Navigate>`; it is cleared once we leave `/`.
 * The ref is the real one-shot gate (never read during render — eslint).
 * AppProvider remains the source of truth for locale (URL → lang).
 */
export function LocalePreferenceRedirect() {
  const location = useLocation();
  const consumedRef = useRef(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useLayoutEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;

    if (location.pathname === "/" && readStoredLang() === "en") {
      setShouldRedirect(true);
    }
  }, [location.pathname]);

  useLayoutEffect(() => {
    if (shouldRedirect && location.pathname !== "/") {
      setShouldRedirect(false);
    }
  }, [shouldRedirect, location.pathname]);

  if (!shouldRedirect || location.pathname !== "/") return null;
  return <Navigate to="/en" replace />;
}
