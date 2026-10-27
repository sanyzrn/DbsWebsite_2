import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { answerDemo, buildDemoConfig, DEMO_KNOWLEDGE, DEMO_REST, installDemoBackend, normalize } from "../lib/nexachat/demo";
import { NEXACHAT_COPY } from "../lib/nexachat/copy";
import { NEXACHAT_LANDING, NEXACHAT_SHOTS } from "../lib/nexachat/landing";
import { listPrerenderPaths, resolveSeoForPath } from "../lib/seo";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
});

describe("NexaChatAI demo page", () => {
  it("is prerendered in both languages with its own SEO", () => {
    const paths = listPrerenderPaths();
    expect(paths).toContain("/nexachatai");
    expect(paths).toContain("/en/nexachatai");
    expect(resolveSeoForPath("/nexachatai").title).toBe(NEXACHAT_COPY.fa.seoTitle);
    expect(resolveSeoForPath("/en/nexachatai").title).toBe(NEXACHAT_COPY.en.seoTitle);
  });

  it("keeps the landing copy and demo questions in step across languages", () => {
    expect(NEXACHAT_LANDING.en.why.items).toHaveLength(NEXACHAT_LANDING.fa.why.items.length);
    expect(NEXACHAT_LANDING.en.stats).toHaveLength(NEXACHAT_LANDING.fa.stats.length);
    expect(NEXACHAT_LANDING.en.dashboard.shots).toHaveLength(NEXACHAT_LANDING.fa.dashboard.shots.length);
    expect(NEXACHAT_SHOTS).toHaveLength(NEXACHAT_LANDING.fa.dashboard.shots.length);
    expect(DEMO_KNOWLEDGE.en.entries.map((e) => e.id)).toEqual(DEMO_KNOWLEDGE.fa.entries.map((e) => e.id));
    expect(DEMO_KNOWLEDGE.fa.starters.length).toBeGreaterThanOrEqual(10);
    expect(DEMO_KNOWLEDGE.en.starters).toHaveLength(DEMO_KNOWLEDGE.fa.starters.length);
  });

  it("answers every sample question from the shop knowledge, not the fallback", () => {
    for (const lang of ["fa", "en"] as const) {
      for (const question of DEMO_KNOWLEDGE[lang].starters) {
        expect(answerDemo(lang, question).id, `${lang}: ${question}`).not.toBe("fallback");
      }
    }
  });

  it("keeps Persian and English copy aligned", () => {
    const fa = NEXACHAT_COPY.fa;
    const en = NEXACHAT_COPY.en;
    expect(en.features.items).toHaveLength(fa.features.items.length);
    expect(en.faq.items).toHaveLength(fa.faq.items.length);
    expect(en.steps.items).toHaveLength(fa.steps.items.length);
  });

  it.each([
    ["/nexachatai", "rtl"],
    ["/en/nexachatai", "ltr"],
  ])("renders %s as a standalone page with a single h1 and the widget mount", (path, dir) => {
    window.history.replaceState(null, "", path);
    const { container } = render(<App />);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.querySelector(".ncl")).toHaveAttribute("dir", dir);
    expect(container.querySelector("#ssc-chatbot-root")).not.toBeNull();
    expect(container.querySelector("header.nav-bar")).toBeNull();
    expect(container.querySelector("footer.bg-footer")).toBeNull();
  });

  it("serves the product page at /nexachatai as an indexable page", () => {
    expect(resolveSeoForPath("/nexachatai").robots).toBeUndefined();
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
