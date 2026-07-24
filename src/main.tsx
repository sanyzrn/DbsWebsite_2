import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

/* Self-hosted fonts (replaces Google Fonts <link>s). font-display: swap.
 * Weights trimmed to those actually used in CSS/components (no Vazirmatn 300). */
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource/ibm-plex-mono/700.css";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/600.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/vazirmatn/800.css";
import "@fontsource/vazirmatn/900.css";

import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DECORATIVE_PARTICLE_EFFECTS_ENABLED } from "./lib/decorativeEffects";

if (DECORATIVE_PARTICLE_EFFECTS_ENABLED) {
  document.documentElement.classList.add("decorative-particle-effects");
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

const tree = (
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, tree);
} else {
  createRoot(rootEl).render(tree);
}

/* Register the service worker only in production builds (virtual module from vite-plugin-pwa). */
if (import.meta.env.PROD) {
  void import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}
