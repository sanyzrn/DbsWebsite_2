import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { answerDemo, buildDemoConfig, DEMO_REST, installDemoBackend, normalize } from "../lib/nexachat/demo";
import { NEXACHAT_COPY } from "../lib/nexachat/copy";
import { listPrerenderPaths, resolveSeoForPath } from "../lib/seo";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
});

describe("NexaChatAI demo page", () => {
  it("is prerendered in both languages with its own SEO", () => {
    const paths = listPrerenderPaths();
    expect(paths).toContain("/nexachat");
    expect(paths).toContain("/en/nexachat");
    expect(resolveSeoForPath("/nexachat").title).toBe(NEXACHAT_COPY.fa.seoTitle);
    expect(resolveSeoForPath("/en/nexachat").title).toBe(NEXACHAT_COPY.en.seoTitle);
  });

  it("keeps Persian and English copy aligned", () => {
    const fa = NEXACHAT_COPY.fa;
    const en = NEXACHAT_COPY.en;
    expect(en.features.items).toHaveLength(fa.features.items.length);
    expect(en.faq.items).toHaveLength(fa.faq.items.length);
    expect(en.steps.items).toHaveLength(fa.steps.items.length);
  });

  it.each([
    ["/nexachat", "rtl"],
    ["/en/nexachat", "ltr"],
  ])("renders %s with a single h1 and a demo host", (path) => {
    window.history.replaceState(null, "", path);
    const { container } = render(<App />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(container.querySelector("[data-nexachat-demo], .nexachat-demo")).not.toBeNull();
  });
});

describe("scripted demo backend", () => {
  it("normalises Persian digits, Arabic letters and diacritics", () => {
    expect(normalize("كيف ۱۲٣ ؟")).toBe("کیف 123");
    expect(normalize("سَلام")).toBe("سلام");
  });

  it("answers known questions from the sample knowledge and falls back politely", () => {
    const hit = answerDemo("fa", "ساعت کاری کلینیک چطوره؟");
    expect(hit.reply.length).toBeGreaterThan(10);
    const miss = answerDemo("en", "zzzz qqqq");
    expect(miss.reply.length).toBeGreaterThan(10);
  });

  it("builds a widget config pointing at the fake REST root", () => {
    const cfg = buildDemoConfig("fa") as { restUrl: string };
    expect(cfg.restUrl).toBe(DEMO_REST);
  });

  it("intercepts only demo URLs and restores fetch on cleanup", async () => {
    const original = vi.fn(async () => new Response("real"));
    const mock = original as unknown as typeof window.fetch;
    window.fetch = mock;
    const restore = installDemoBackend("en", 0);
    const res = await window.fetch(`${DEMO_REST}chat`, { method: "POST", body: new URLSearchParams({ message: "hello" }).toString() });
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(typeof json.reply).toBe("string");
    await window.fetch("/other");
    expect(original).toHaveBeenCalledTimes(1);
    restore();
    expect(window.fetch).toBe(mock);
  });
});
