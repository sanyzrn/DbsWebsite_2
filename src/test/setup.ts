import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

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
