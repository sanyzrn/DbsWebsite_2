# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single, frontend-only React 19 + Vite 7 + Tailwind CSS 4 (TypeScript) portfolio SPA. There is no backend, database, tests, or lint config.

### Services
- Dev server: `npm run dev` (Vite, serves on http://localhost:5173). Use this for development (HMR).
- Production-like preview: `npm run build` then `npm run preview`.

### Notes
- Dependencies are installed on startup via the update script (`npm install`), so you normally don't need to reinstall.
- There is no lint script and no test framework configured. `npm run build` runs `vite build` and is the closest thing to a compile/type check.
- The production build uses `vite-plugin-singlefile`, which inlines all JS/CSS into a single `dist/index.html`. This is expected; there are no separate asset files in `dist/`.
- All UI copy and project data live in `src/lib/i18n.ts` (Persian + English). Language (fa/en, RTL/LTR) and theme (light/dark) are managed via React Context in `src/lib/app.tsx` and persisted to `localStorage`.
- The contact form has no backend; it builds a `mailto:` link on submit.
