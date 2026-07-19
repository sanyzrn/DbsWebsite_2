import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { readStoredLang } from "../lib/app";

/**
 * First client entry only: if the visitor lands on `/` (Persian default) but
 * previously chose English, replace to `/en`.
 *
 * Decision is captured once at mount via useState (survives StrictMode and does
 * not re-run on later in-app navigations to `/`). That way switching
 * English → Persian cannot be overridden by a stale `sz-lang=en`. Uses
 * declarative `<Navigate>` so React Router state stays in sync.
 */
export function LocalePreferenceRedirect() {
  const location = useLocation();
  const [shouldRedirect] = useState(
    () => location.pathname === "/" && readStoredLang() === "en"
  );

  if (!shouldRedirect || location.pathname !== "/") return null;
  return <Navigate to="/en" replace />;
}
