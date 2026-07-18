import { useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { readStoredLang } from "../lib/app";

/**
 * On a first visit to `/` (Persian default), honor a stored English preference by
 * navigating to `/en`. Language is never swapped without a URL change.
 */
export function LocalePreferenceRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (location.pathname !== "/") return;
    if (readStoredLang() !== "en") return;
    navigate("/en", { replace: true });
  }, [location.pathname, navigate]);

  return null;
}
