import { cleanup, render, waitFor } from "@testing-library/react";
import { useEffect, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import ScrollToTop from "../components/ScrollToTop";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** Mounts `#expertise` only after a short delay — mimics a lazy home section after route change. */
function LateHashTarget({ delayMs = 40 }: { delayMs?: number }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs]);
  return ready ? <section id="expertise">Expertise</section> : <p>Loading route…</p>;
}

describe("ScrollToTop hash retries", () => {
  it("retries until a late-mounted hash target appears, then scrolls", async () => {
    const scrollIntoView = vi.fn();
    const original = document.getElementById.bind(document);
    vi.spyOn(document, "getElementById").mockImplementation((id: string) => {
      const el = original(id);
      if (el && id === "expertise") {
        el.scrollIntoView = scrollIntoView;
      }
      return el;
    });

    render(
      <MemoryRouter initialEntries={["/#expertise"]}>
        <ScrollToTop />
        <LateHashTarget delayMs={40} />
      </MemoryRouter>
    );

    // One frame is not enough — target mounts asynchronously.
    expect(scrollIntoView).not.toHaveBeenCalled();

    await waitFor(
      () => {
        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
      },
      { timeout: 2000 }
    );
  });

  it("scrolls to top when there is no hash", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={["/en/about"]}>
        <ScrollToTop />
      </MemoryRouter>
    );
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });
});
