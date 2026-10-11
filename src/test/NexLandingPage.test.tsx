import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App, { AppShell } from "../App";
import { NEX_EXPERIENCE, normalizeNexDemo } from "../lib/nexExperience";
import { NEX_COPY, NEX_NOTE_KEY, NEX_NOTE_LIMIT } from "../lib/nex";
import { listPrerenderPaths, resolveSeoForPath } from "../lib/seo";
import siteRoutes from "../../shared/site-routes.json";
import fs from "node:fs";

function open(path = "/nex/") {
  window.history.replaceState(null, "", path);
  return render(<App />);
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  delete document.documentElement.dataset.nexTheme;
  window.history.replaceState(null, "", "/");
});

describe("Nex timeline and routing", () => {
  it.each(["/nex", "/nex/", "/en/nex", "/en/nex/"])("serves %s as an independent, readable timeline", (path) => {
    const { container } = open(path);
    const en = path.startsWith("/en");
    const c = NEX_COPY[en ? "en" : "fa"];
    const e = NEX_EXPERIENCE[en ? "en" : "fa"];
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(e.heroLine1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(e.heroLine2);
    expect(container.querySelector(".nex-page")).toHaveAttribute("dir", en ? "ltr" : "rtl");
    expect(container.querySelectorAll(".nex-day-notes > article, .nex-day-notes > .nex-local-stage")).toHaveLength(6);
    expect(screen.getByRole("heading", { name: c.today })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: c.yesterday })).toBeInTheDocument();
    expect(screen.getAllByText(c.tagline).length).toBeGreaterThan(0);
    expect(container.querySelector("header.nav-bar, footer.bg-footer, .intro, .product-launch")).toBeNull();
    expect(screen.queryByText(/Google Play/)).not.toBeInTheDocument();
    expect(document.title).toBe(c.seoTitle);
  });

  it("renders the actual cards on the server, before JavaScript runs", () => {
    for (const lang of ["fa", "en"] as const) {
      const path = lang === "fa" ? "/nex/" : "/en/nex/";
      const html = renderToString(<StaticRouter location={path}><AppShell /></StaticRouter>);
      const c = NEX_COPY[lang];
      expect(html).toContain(NEX_EXPERIENCE[lang].heroLine1);
      expect(html).toContain("nex-orbit-scene");
      expect(html).toContain(c.downloadTitle);
      expect(html).toContain(c.introText);
      expect(html).toContain(c.privateText);
      expect(html).toContain(c.tagline);
      expect(html).toContain("<details");
      expect(html).toContain("<noscript>");
      expect(html).toMatch(/<textarea[^>]*disabled/);
      expect(html).not.toContain("product-launch__hero");
      expect(html).not.toContain("nav-bar");
    }
  });

  it("uses truthful unavailable download links and a visible missing-image slot", () => {
    open();
    for (const name of [NEX_COPY.fa.bazaar, NEX_COPY.fa.myket]) {
      const store = screen.getByRole("link", { name });
      expect(store).toHaveAttribute("href", "#");
      expect(store).toHaveAttribute("aria-disabled", "true");
      expect(store.getAttribute("data-todo")).toMatch(/TODO:/);
    }
    expect(screen.getByText(NEX_COPY.fa.storePending)).toBeVisible();
    expect(screen.getByText(NEX_COPY.fa.screenshot)).toBeVisible();
    expect(document.querySelector(".nex-page img")).toBeNull();
  });

  it("has a native voice-text disclosure and locale/theme controls", () => {
    open();
    const summary = screen.getByText(NEX_COPY.fa.voiceCaption);
    expect(summary.closest("details")?.querySelector("p")?.textContent).toBe(NEX_COPY.fa.voiceText);
    fireEvent.click(screen.getByRole("button", { name: NEX_COPY.fa.themeLabel }));
    expect(document.documentElement).toHaveClass("dark");
    fireEvent.click(screen.getByRole("link", { name: NEX_COPY.fa.languageLabel }));
    expect(document.querySelector(".nex-page")).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("textbox")).toHaveAttribute("dir", "auto");
  });
});

describe("Nex browser-only note", () => {
  it("creates, restores across visits/locales, and deletes a note without a Save action", () => {
    open();
    const input = screen.getByRole("textbox");
    expect(input).toBeEnabled();
    fireEvent.change(input, { target: { value: "قرار کافه — design review ۱۲" } });
    expect(JSON.parse(localStorage.getItem(NEX_NOTE_KEY)!)).toEqual({ text: "قرار کافه — design review ۱۲" });
    expect(document.querySelector(".nex-draft")).toHaveClass("nex-draft--written");
    expect(screen.getByRole("status")).toHaveTextContent(NEX_COPY.fa.draftSaved);
    cleanup();
    open("/en/nex/");
    expect(screen.getByRole("textbox")).toHaveValue("قرار کافه — design review ۱۲");
    expect(screen.queryByRole("button", { name: /^save$/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: NEX_COPY.en.draftClear }));
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(localStorage.getItem(NEX_NOTE_KEY)).toBeNull();
  });

  it("remains usable when reading or writing browser storage is denied", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Denied", "SecurityError"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Full", "QuotaExceededError"); });
    open();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "فکر من" } });
    expect(screen.getByRole("textbox")).toHaveValue("فکر من");
    expect(screen.getByRole("status")).toHaveTextContent(NEX_COPY.fa.draftSession);
  });

  it.each(["invalid JSON", '{"text": 12}', '{"text": null}'])("ignores malformed storage: %s", (raw) => {
    localStorage.setItem(NEX_NOTE_KEY, raw);
    open();
    expect(screen.getByRole("textbox")).toHaveValue("");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Fresh" } });
    expect(JSON.parse(localStorage.getItem(NEX_NOTE_KEY)!)).toEqual({ text: "Fresh" });
  });

  it("bounds restored text and displays text literally, never as HTML", () => {
    localStorage.setItem(NEX_NOTE_KEY, JSON.stringify({ text: "x".repeat(3000) }));
    open();
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toHaveLength(NEX_NOTE_LIMIT);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: '<img src=x onerror="alert(1)">' } });
    expect(document.querySelector(".nex-draft img")).toBeNull();
    expect(screen.getByRole("textbox")).toHaveValue('<img src=x onerror="alert(1)">');
  });
});

describe("Nex SEO, sitemap and isolated motion", () => {
  it("maps both routes to a real, indexable page with reciprocal locale SEO and factual software data", () => {
    expect(siteRoutes.pageKeys["/nex"]).toBe("nex");
    expect(siteRoutes.noindexPaths).not.toContain("/nex");
    for (const slug of ["nexahr", "nexachatai", "nexaslider"]) {
      expect(siteRoutes.noindexPaths).toContain(`/${slug}`);
      expect(resolveSeoForPath(`/${slug}`).robots).toBe("noindex, follow");
    }
    for (const path of ["/nex", "/en/nex"]) {
      expect(listPrerenderPaths()).toContain(path);
      const seo = resolveSeoForPath(path);
      expect(seo.robots).toBeUndefined();
      expect(seo.canonical).toBe(`https://dbsstudio.ir${path}`);
      expect(seo.alternateFa).toBe("https://dbsstudio.ir/nex");
      expect(seo.alternateEn).toBe("https://dbsstudio.ir/en/nex");
      expect(seo.image).toBe("https://dbsstudio.ir/images/nex/og.jpg");
      const graph = seo.jsonLd[0]["@graph"] as Record<string, unknown>[];
      const app = graph.find((entry) => entry["@type"] === "SoftwareApplication");
      expect(app?.operatingSystem).toBe("Android 7.0+");
      expect(app?.offers).toBeUndefined();
      expect(app?.aggregateRating).toBeUndefined();
      expect(app?.review).toBeUndefined();
    }
  });

  it("includes only Nex among the completed product landings in the generated sitemap", () => {
    const xml = fs.readFileSync("public/sitemap.xml", "utf8");
    for (const path of ["/nex", "/en/nex"]) expect(xml).toContain(`<loc>https://dbsstudio.ir${path}</loc>`);
    for (const slug of ["nexahr", "nexachatai", "nexaslider"]) expect(xml).not.toContain(`<loc>https://dbsstudio.ir/${slug}</loc>`);
  });

  it("keeps animation enhancement visible and provides reduced-motion and 320px layout rules", () => {
    const css = fs.readFileSync("src/pages/nex-landing.css", "utf8");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation: none !important");
    expect(css).toContain("@media (max-width: 380px)");
    expect(css).not.toMatch(/opacity:\s*0(?:\D|$)/);
    expect(css).not.toMatch(/url\(["']?https?:/);
    expect(css).toContain('font-family: "Nex Inter"');
  });
});


describe("Nex world interactions", () => {
  it("switches capture illustrations through native keyboard-accessible radios", () => {
    open();
    const voice = screen.getByRole("radio", { name: NEX_COPY.fa.voiceLabel });
    expect(screen.getByRole("radio", { name: NEX_COPY.fa.textLabel })).toBeChecked();
    fireEvent.click(voice);
    expect(voice).toBeChecked();
    expect(document.querySelector(".nex-universe")).toHaveAttribute("data-mode", "voice");
    fireEvent.click(screen.getByRole("radio", { name: NEX_COPY.fa.checklistLabel }));
    expect(document.querySelector(".nex-universe")).toHaveAttribute("data-mode", "checklist");
  });

  it("pauses and resumes continuous motion without affecting the note", () => {
    open();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "A thought" } });
    fireEvent.click(screen.getByRole("button", { name: NEX_EXPERIENCE.fa.motionPause }));
    expect(document.querySelector(".nex-page")).toHaveAttribute("data-motion", "paused");
    expect(screen.getByRole("button", { name: NEX_EXPERIENCE.fa.motionPlay })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: NEX_EXPERIENCE.fa.motionPlay }));
    expect(document.querySelector(".nex-page")).toHaveAttribute("data-motion", "playing");
    expect(screen.getByRole("textbox")).toHaveValue("A thought");
  });

  it("demonstrates Persian normalisation locally, without treating the app demo as a real search service", () => {
    open();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "كافه 12" } });
    expect(screen.getByText(NEX_EXPERIENCE.fa.searchFound)).toBeInTheDocument();
    expect(document.querySelector(".nex-search-result")).toHaveAttribute("data-match", "true");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "unrelated" } });
    expect(screen.getByText(NEX_EXPERIENCE.fa.searchEmpty)).toBeInTheDocument();
    expect(screen.getByText(NEX_EXPERIENCE.fa.searchDemo)).toBeInTheDocument();
    expect(localStorage.getItem(NEX_NOTE_KEY)).toBeNull();
  });

  it("keeps the native vault disclosure and chapter navigation usable without custom navigation", () => {
    open();
    const summary = screen.getByText(NEX_EXPERIENCE.fa.vaultLabel).closest("summary");
    expect(summary?.closest("details")?.querySelector("p")).toHaveTextContent(NEX_EXPERIENCE.fa.vaultInside);
    const nav = screen.getByRole("navigation", { name: NEX_EXPERIENCE.fa.dayNav });
    expect(nav.querySelectorAll('a[href^="#nex-"]')).toHaveLength(3);
  });

  it("normalises letter variants, half-spaces and both numeral sets in the illustrative search", () => {
    expect(normalizeNexDemo("كافه ۱۲۳")).toBe(normalizeNexDemo("کافه 123"));
    expect(normalizeNexDemo("يادداشت\u200c۱۲")).toBe(normalizeNexDemo("یادداشت ١٢"));
  });
});

describe("Nex loading intro", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.classList.remove("nex-intro-play", "nex-intro-skip", "nex-intro-done");
  });

  it("is decorative, in the server HTML, and shown only when the pre-paint script asks for it", () => {
    const html = renderToString(<StaticRouter location="/nex/"><AppShell /></StaticRouter>);
    expect(html).toMatch(/<div class="nex-intro" aria-hidden="true">/);
    const css = fs.readFileSync("src/components/nex/nex-intro.css", "utf8");
    expect(css).toMatch(/^\.nex-intro \{ display: none; \}$/m);
    expect(css).toContain("html.nex-intro-play .nex-intro {");
    expect(css).toContain("html.nex-intro-done .nex-intro { display: none; }");
    const script = fs.readFileSync("index.html", "utf8");
    expect(script).toContain('if (isNex && !calm && !sessionStorage.getItem("nex-intro"))');
    expect(script).toContain('if (!isNex && !calm && !sessionStorage.getItem("sz-intro"))');
  });

  it("gets out of the way on a key or a tap, and on its own", () => {
    vi.useFakeTimers();
    const root = document.documentElement;
    root.classList.add("nex-intro-play");
    open();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(root).toHaveClass("nex-intro-skip");
    vi.advanceTimersByTime(400);
    expect(root).toHaveClass("nex-intro-done");
    cleanup();
    root.classList.remove("nex-intro-skip", "nex-intro-done");
    open();
    vi.advanceTimersByTime(3200);
    expect(root).toHaveClass("nex-intro-done");
    expect(root).not.toHaveClass("nex-intro-skip");
  });

  it("draws the whole brand: the octopus's two eyes and the wordmark's dot", () => {
    const { container } = open();
    const mark = container.querySelector(".nex-mark");
    expect(mark?.querySelectorAll("circle")).toHaveLength(2);
    expect(container.querySelector(".nex-wordmark")?.querySelectorAll("circle")).toHaveLength(1);
  });
});
