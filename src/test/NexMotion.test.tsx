import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ThoughtStage from "../components/nex/ThoughtStage";
import TimelineThread from "../components/nex/TimelineThread";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Nex lightweight motion", () => {
  it("bounds the gaze, resets on exit, and ignores touch and reduced motion", async () => {
    let calm = false;
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query.includes("reduced-motion") ? calm : true,
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }) as unknown as MediaQueryList);
    const { unmount } = render(<ThoughtStage lang="fa" />);
    const scene = document.querySelector<HTMLElement>(".nex-orbit-scene")!;
    const pointer = (type: string) => {
      const event = new Event("pointermove");
      Object.defineProperties(event, { clientX: { value: 10000 }, clientY: { value: 10000 }, pointerType: { value: type } });
      fireEvent(scene, event);
    };
    pointer("mouse");
    await waitFor(() => expect(scene.style.getPropertyValue("--nx-eye-x")).not.toBe(""));
    expect(Math.abs(parseFloat(scene.style.getPropertyValue("--nx-eye-x")))).toBeLessThanOrEqual(7);
    expect(Math.abs(parseFloat(scene.style.getPropertyValue("--nx-eye-y")))).toBeLessThanOrEqual(7);
    fireEvent.pointerLeave(scene);
    expect(scene.style.getPropertyValue("--nx-eye-x")).toBe("");
    pointer("touch");
    await act(async () => { await new Promise((resolve) => requestAnimationFrame(resolve)); });
    expect(scene.style.getPropertyValue("--nx-eye-x")).toBe("");
    unmount();
    calm = true;
    render(<ThoughtStage lang="fa" />);
    const reducedScene = document.querySelector<HTMLElement>(".nex-orbit-scene")!;
    const event = new Event("pointermove");
    Object.defineProperties(event, { clientX: { value: 10000 }, clientY: { value: 10000 }, pointerType: { value: "mouse" } });
    fireEvent(reducedScene, event);
    await act(async () => { await new Promise((resolve) => requestAnimationFrame(resolve)); });
    expect(reducedScene.style.getPropertyValue("--nx-eye-x")).toBe("");
  });

  it("draws and reverses with scroll, stays complete under reduced motion, and cleans up", async () => {
    let top = 1200;
    let calm = false;
    const mediaListeners = new Set<() => void>();
    vi.spyOn(window, "matchMedia").mockImplementation(() => ({
      get matches() { return calm; },
      addEventListener: (_: string, fn: () => void) => mediaListeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => mediaListeners.delete(fn),
    }) as unknown as MediaQueryList);
    const remove = vi.spyOn(window, "removeEventListener");
    const originalLength = Object.getOwnPropertyDescriptor(SVGElement.prototype, "getTotalLength");
    const originalPoint = Object.getOwnPropertyDescriptor(SVGElement.prototype, "getPointAtLength");
    Object.defineProperty(SVGElement.prototype, "getTotalLength", { configurable: true, value: () => 2000 });
    Object.defineProperty(SVGElement.prototype, "getPointAtLength", { configurable: true, value: (n: number) => ({ x: 400, y: n }) });
    try {
      const { unmount } = render(<div className="nex-timeline"><TimelineThread lang="en" /></div>);
      const timeline = document.querySelector<HTMLElement>(".nex-timeline")!;
      Object.defineProperties(timeline, { clientWidth: { value: 800 }, clientHeight: { value: 2000 } });
      vi.spyOn(timeline, "getBoundingClientRect").mockImplementation(() => ({ top, height: 2000 }) as DOMRect);
      fireEvent(window, new Event("resize"));
      const svg = timeline.querySelector<SVGSVGElement>("svg")!;
      await waitFor(() => expect(svg.dataset.progress).toBe("0.000"));
      top = -2000;
      fireEvent.scroll(window);
      await waitFor(() => expect(svg.dataset.progress).toBe("1.000"));
      top = 0;
      fireEvent.scroll(window);
      await waitFor(() => {
        expect(Number(svg.dataset.progress)).toBeGreaterThan(0);
        expect(Number(svg.dataset.progress)).toBeLessThan(1);
      });
      calm = true;
      act(() => mediaListeners.forEach((fn) => fn()));
      await waitFor(() => expect(svg.dataset.progress).toBe("1.000"));
      expect(svg.dataset.calm).toBe("true");
      unmount();
      expect(mediaListeners.size).toBe(0);
      expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
      expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
    } finally {
      if (originalLength) Object.defineProperty(SVGElement.prototype, "getTotalLength", originalLength);
      else Reflect.deleteProperty(SVGElement.prototype, "getTotalLength");
      if (originalPoint) Object.defineProperty(SVGElement.prototype, "getPointAtLength", originalPoint);
      else Reflect.deleteProperty(SVGElement.prototype, "getPointAtLength");
    }
  });
});
