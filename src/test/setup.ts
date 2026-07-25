import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { articlesLoadPromise } from "../lib/articles";
import { projectsLoadPromise } from "../lib/projects";
import { preloadAllPages } from "../lib/routesFromManifest";

// MagicDust / R3F need a real WebGL canvas — stub the module in jsdom unit tests.
vi.mock("../components/ui/magic-dust-shader", () => ({
  MagicDust: () => null,
  MagicDustCore: () => null,
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, "IntersectionObserver", { writable: true, value: IO });

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, "ResizeObserver", { writable: true, value: RO });

// Pre-load all content and page chunks so that:
//  - getCache() in articles.ts / projects.ts returns data instead of throwing a Promise.
//  - AppProvider (getDictionary → getLocalizedProjects) works synchronously in tests.
//  - syncCompatibleLazy components resolve synchronously — tests can use getBy* queries.
//  - All dynamic import() Promises settle before the environment is torn down (avoids
//    EnvironmentTeardownError from pending imports at cleanup time).
//
//  Note: Contact.project-type.test.tsx previously used vi.mock("../lib/app") which
//  conflicted with pre-loaded modules. It now uses AppCtx.Provider directly — no
//  module mocking — so preloadAllPages() is safe to include here.
await Promise.all([articlesLoadPromise, projectsLoadPromise, preloadAllPages()]);
