import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Hero from "../components/Hero";
import { AppProvider } from "../lib/app";
import {
  computeMagicDustEnabled,
  magicDustParticleCount,
  MAGIC_DUST_PARTICLES_DESKTOP,
  MAGIC_DUST_PARTICLES_MOBILE,
  MAGIC_DUST_PARTICLES_TABLET,
} from "../lib/magicDustGate";

const magicDustMock = vi.fn((props: Record<string, unknown>) => (
  <div data-testid="magic-dust-canvas" data-particles={String(props.particleCount ?? "")} />
));

vi.mock("../components/ui/magic-dust-shader", () => ({
  MagicDust: (props: Record<string, unknown>) => magicDustMock(props),
  MagicDustCore: () => null,
}));

function mockMatchMedia(matchesQuery: (query: string) => boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: matchesQuery(query),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

function renderHero() {
  return render(
    <MemoryRouter>
      <AppProvider>
        <Hero />
      </AppProvider>
    </MemoryRouter>
  );
}

afterEach(() => {
  cleanup();
  magicDustMock.mockClear();
  vi.restoreAllMocks();
  localStorage.clear();
});

beforeEach(() => {
  // Default: motion allowed, fine pointer, desktop width, plenty of memory.
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1280 });
  Object.defineProperty(navigator, "deviceMemory", { writable: true, configurable: true, value: 8 });
  mockMatchMedia(() => false);
});

describe("magicDustParticleCount", () => {
  it("scales desktop / tablet / mobile budgets", () => {
    expect(magicDustParticleCount(1280)).toBe(MAGIC_DUST_PARTICLES_DESKTOP);
    expect(magicDustParticleCount(1024)).toBe(MAGIC_DUST_PARTICLES_DESKTOP);
    expect(magicDustParticleCount(800)).toBe(MAGIC_DUST_PARTICLES_TABLET);
    expect(magicDustParticleCount(640)).toBe(MAGIC_DUST_PARTICLES_TABLET);
    expect(magicDustParticleCount(390)).toBe(MAGIC_DUST_PARTICLES_MOBILE);
  });
});

describe("computeMagicDustEnabled", () => {
  it("returns false under prefers-reduced-motion", () => {
    mockMatchMedia((q) => q.includes("prefers-reduced-motion"));
    expect(computeMagicDustEnabled()).toBe(false);
  });

  it("returns false when deviceMemory is under 4", () => {
    Object.defineProperty(navigator, "deviceMemory", { writable: true, configurable: true, value: 2 });
    expect(computeMagicDustEnabled()).toBe(false);
  });

  it("returns false for coarse pointer + narrow viewport", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 390 });
    mockMatchMedia((q) => q.includes("pointer: coarse"));
    expect(computeMagicDustEnabled()).toBe(false);
  });

  it("returns true on a capable desktop", () => {
    expect(computeMagicDustEnabled()).toBe(true);
  });
});

describe("Hero MagicDust gates", () => {
  it("does not render MagicDust when prefers-reduced-motion is reduce (static atmosphere only)", () => {
    mockMatchMedia((q) => q.includes("prefers-reduced-motion"));
    renderHero();

    expect(screen.queryByTestId("magic-dust-layer")).toBeNull();
    expect(screen.queryByTestId("magic-dust-canvas")).toBeNull();
    expect(magicDustMock).not.toHaveBeenCalled();
    // Static glow fallback stays mounted
    expect(document.querySelector(".hero-atmosphere")).toBeTruthy();
  });

  it("mounts MagicDust when motion is allowed on desktop", async () => {
    renderHero();
    expect(screen.getByTestId("magic-dust-layer")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId("magic-dust-canvas")).toBeTruthy();
    });
    expect(screen.getByTestId("magic-dust-canvas").getAttribute("data-particles")).toBe(
      String(MAGIC_DUST_PARTICLES_DESKTOP)
    );
  });
});
