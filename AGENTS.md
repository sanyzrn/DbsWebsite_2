# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single, frontend-only React 19 + Vite 7 + Tailwind CSS 4 (TypeScript) portfolio SPA. There is no backend or database.

### Services
- Dev server: `npm run dev` (Vite, serves on http://localhost:5173). Use this for development (HMR).
- Production-like preview: `npm run build` then `npm run preview`.

### Commands
- Typecheck: `npm run typecheck` (`tsc --noEmit`)
- Tests: `npm test` (Vitest + Testing Library smoke tests)
- Build: `npm run build` (client bundle + SSR prerender → static HTML per route in `dist/`)

### Notes
- Dependencies are installed on startup via the update script (`npm install`), so you normally don't need to reinstall.
- Production build emits normal Vite assets plus a static HTML file per route (prerender). Locale is derived from the URL (`/` = fa, `/en…` = en); `localStorage` only remembers preference for redirecting a first visit to `/` toward `/en` when appropriate.
- All UI copy lives in `src/lib/i18n.ts` (Persian + English); project case studies live in `content/projects/*.json`. Theme (light/dark) is managed via React Context in `src/lib/app.tsx` and persisted to `localStorage`. An inline script in `index.html` applies theme + URL-derived lang/dir before first paint to avoid FOUC.
- Contact form: set `VITE_FORMSPREE_ID` for real Formspree delivery; without it, submit uses an honest `mailto:` fallback (does not claim server delivery). Always keep the visible direct-email link.
- PWA: `vite-plugin-pwa` (generateSW). Icons via `npm run generate:icons`. After prerender, `scripts/generate-sw.mjs` rebuilds the service worker so all locale HTML is precached. Offline fallback is `public/offline.html`. Admin/PHP routes are denylisted.
- ⌘K / Ctrl+K opens the command palette.
- English UI uses self-hosted Bricolage Grotesque (variable) + IBM Plex Mono; Persian uses Vazirmatn (`@fontsource` packages imported in `src/main.tsx`).
