# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single, frontend-only React 19 + Vite 7 + Tailwind CSS 4 (TypeScript) portfolio SPA. There is no backend or database.

### Services
- Dev server: `npm run dev` (Vite, serves on http://localhost:5173). Use this for development (HMR).
- Production-like preview: `npm run build` then `npm run preview`.

### Commands
- Typecheck: `npm run typecheck` (`tsc --noEmit`)
- Tests: `npm test` (Vitest + Testing Library smoke tests)
- Build: `npm run build` (single-file `dist/index.html` via `vite-plugin-singlefile`)

### Notes
- Dependencies are installed on startup via the update script (`npm install`), so you normally don't need to reinstall.
- The production build uses `vite-plugin-singlefile`, which inlines all JS/CSS into a single `dist/index.html`. Public assets (`favicon.svg`, `og.jpg`, `robots.txt`, etc.) still emit beside it.
- All UI copy and project data live in `src/lib/i18n.ts` (Persian + English). Language (fa/en, RTL/LTR) and theme (light/dark) are managed via React Context in `src/lib/app.tsx` and persisted to `localStorage`. An inline script in `index.html` applies those before first paint to avoid FOUC.
- Contact form: set `VITE_FORMSPREE_ID` for real Formspree delivery; without it, submit uses an honest `mailto:` fallback (does not claim server delivery). Always keep the visible direct-email link.
- ⌘K / Ctrl+K opens the command palette.
- English UI uses Bricolage Grotesque + IBM Plex Mono; Persian uses Vazirmatn.
