import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

/* Self-hosted, subset-trimmed type (Archivo · Vazirmatn · Noto Kufi Arabic). */
import "./styles/fonts.css";

import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";

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
