/** Canonical public site origin — set via SITE_URL at build time (see .env.example). */
export function getSiteUrl(): string {
  const raw = import.meta.env.VITE_SITE_URL as string | undefined;
  if (!raw) {
    throw new Error("VITE_SITE_URL is not defined — set SITE_URL in the environment before building.");
  }
  return raw.replace(/\/+$/, "");
}
