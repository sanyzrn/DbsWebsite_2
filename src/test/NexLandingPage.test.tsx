import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App, { AppShell } from "../App";
import { NEX_EXPERIENCE, normalizeNexDemo } from "../lib/nexExperience";
import { NEX_COPY, NEX_NOTE_KEY, NEX_NOTE_LIMIT, NEX_STORES } from "../lib/nex";
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
  it("keeps every product UI key and list aligned in Persian and English", () => {
    expect(Object.keys(NEX_COPY.fa).sort()).toEqual(Object.keys(NEX_COPY.en).sort());
    for (const key of Object.keys(NEX_COPY.fa) as (keyof typeof NEX_COPY.fa)[]) {
      expect(Array.isArray(NEX_COPY.fa[key])).toBe(Array.isArray(NEX_COPY.en[key]));
      if (Array.isArray(NEX_COPY.fa[key])) expect(NEX_COPY.en[key]).toHaveLength(NEX_COPY.fa[key].length);
    }
  });
  it.each(["/nex", "/nex/", "/en/nex", "/en/nex/"])("serves %s as an independent, readable timeline", (path) => {
    const { container } = open(path);
    const en = path.startsWith("/en");
    const c = NEX_COPY[en ? "en" : "fa"];
    const e = NEX_EXPERIENCE[en ? "en" : "fa"];
    const heroTitle = within(container.querySelector<HTMLElement>(".nex-hero")!).getByRole("heading", { level: 1 });
    expect(heroTitle).toHaveTextContent(e.heroLine1);
    expect(heroTitle).toHaveTextContent(e.heroLine2);
    expect(container.querySelector(".nex-page")).toHaveAttribute("dir", en ? "ltr" : "rtl");
    expect(container.querySelectorAll(".nex-day-notes > article, .nex-day-notes > .nex-local-stage")).toHaveLength(6);
    expect(screen.getByRole("heading", { name: c.today })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: c.yesterday })).toBeInTheDocument();
    expect(screen.getAllByText(c.tagline).length).toBeGreaterThan(0);
    expect(container.querySelector("header.nav-bar, footer.bg-footer, .intro, .product-launch")).toBeNull();
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
      expect(html).toMatch(/href="https:\/\/github.com\/sanyzrn\/DbsNex-releases\/releases\/download\//);
      expect(html).toContain(c.screenshotPreview);
      expect(html).toContain("<noscript>");
      expect(html).toMatch(/<textarea[^>]*disabled/);
      expect(html).not.toContain("product-launch__hero");
      expect(html).not.toContain("nav-bar");
    }
  });

  it.each(["fa", "en"] as const)("shows Android stores as coming soon, a real APK and an honestly labelled preview in %s", (lang) => {
    open(lang === "fa" ? "/nex/" : "/en/nex/");
    const c = NEX_COPY[lang];
    const downloads = document.querySelector<HTMLElement>("#nex-download")!;
    for (const id of Object.keys(NEX_STORES) as (keyof typeof NEX_STORES)[]) {
      const store = within(downloads).getByRole("button", { name: `${c[id]} ${c.storeSoon}` });
      expect(store).toBeDisabled();
      expect(store).not.toHaveAttribute("href");
      expect(store.getAttribute("data-todo")).toMatch(/TODO:/);
      const src = store.querySelector("img")?.getAttribute("src");
      expect(src).toBe(NEX_STORES[id].logo);
      expect(fs.existsSync(`public${src}`)).toBe(true);
    }
    expect(document.querySelectorAll(".nex-store-links button")).toHaveLength(3);
    expect(document.querySelector('a[data-store="apk"]')).toHaveAttribute("href", expect.stringMatching(/^https:\/\/github.com\/sanyzrn\/DbsNex-releases\/releases\/download\//));
    expect(document.querySelector(".nex-hero .nex-store-links")).toBeNull();
    expect(document.querySelector(".nex-chronicle")!.compareDocumentPosition(downloads) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(downloads.querySelectorAll(".nex-store")).toHaveLength(3);
    expect(screen.getByText(c.storePending)).toBeVisible();
    expect(screen.getAllByText(c.screenshotPreview).every((caption) => caption.tagName === "FIGCAPTION")).toBe(true);
    expect(document.querySelector('img[src*="/guide/home"]')).toBeNull();
    expect(document.querySelector(".nex-photo-placeholder")).toBeNull();
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
  it("keeps an overlong restored note editable when its retained text is whitespace", () => {
    localStorage.setItem(NEX_NOTE_KEY, JSON.stringify({ text: " ".repeat(NEX_NOTE_LIMIT) + "A thought", submitted: true }));
    open();
    expect(screen.getByRole("textbox")).toHaveValue(" ".repeat(NEX_NOTE_LIMIT));
    expect(document.querySelector(".nex-draft")).toHaveAttribute("data-submitted", "false");
  });

  it("returns keyboard focus to the editor after deleting a captured note", async () => {
    const user = userEvent.setup();
    open();
    await user.type(screen.getByRole("textbox"), "My thought{enter}");
    await user.click(screen.getByRole("button", { name: NEX_COPY.fa.draftClear }));
    await waitFor(() => expect(screen.getByRole("textbox")).toHaveFocus());
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "nex-draft-privacy nex-draft-status nex-draft-help");
  });
  it("captures with Enter, preserves Shift+Enter, restores the card and allows editing/deletion", async () => {
    const user = userEvent.setup();
    open();
    await user.type(screen.getByRole("textbox"), "Coffee{shift>}{enter}{/shift}Design review{enter}");
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(document.querySelector(".nex-submitted-note > p")).toHaveTextContent("Coffee Design review");
    expect(JSON.parse(localStorage.getItem(NEX_NOTE_KEY)!)).toEqual({ text: "Coffee\nDesign review", submitted: true });
    cleanup();
    open("/en/nex/");
    expect(screen.queryByRole("textbox")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Edit note" }));
    expect(screen.getByRole("textbox")).toHaveValue("Coffee\nDesign review");
    await user.click(screen.getByRole("button", { name: NEX_COPY.en.draftClear }));
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(localStorage.getItem(NEX_NOTE_KEY)).toBeNull();
  });

  it("ignores empty submissions and Enter during IME composition", () => {
    open();
    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toBeVisible();
    expect(localStorage.getItem(NEX_NOTE_KEY)).toBeNull();
    fireEvent.change(input, { target: { value: "فکر" } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(input).toBeVisible();
    expect(document.querySelector(".nex-draft")).toHaveAttribute("data-submitted", "false");
  });

  it("creates, restores across visits/locales, and deletes a note without a Save action", () => {
    open();
    const input = screen.getByRole("textbox");
    expect(input).toBeEnabled();
    fireEvent.change(input, { target: { value: "قرار کافه — design review ۱۲" } });
    expect(JSON.parse(localStorage.getItem(NEX_NOTE_KEY)!)).toEqual({ text: "قرار کافه — design review ۱۲" });
    expect(document.querySelector(".nex-draft")).toHaveClass("nex-draft--written");
    expect(document.querySelector("#nex-draft-status")).toHaveTextContent(NEX_COPY.fa.draftSaved);
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
    expect(document.querySelector("#nex-draft-status")).toHaveTextContent(NEX_COPY.fa.draftSession);
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
      expect(seo.image).toBe(`https://dbsstudio.ir/images/nex/share/${path.startsWith("/en") ? "en" : "fa"}/home.jpg`);
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
  it.each(["fa", "en"] as const)("joins a captured thought to the world in %s and removes it on edit/delete", (lang) => {
    open(lang === "fa" ? "/nex/" : "/en/nex/");
    const text = '<img src=x onerror="alert(1)"> — فکر من';
    fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
    expect(document.querySelector(".nex-universe")).toHaveAttribute("data-personal", "false");
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(document.querySelector(".nex-orbit-thought")).toHaveTextContent(text);
    expect(document.querySelector(".nex-scene-text img")).toBeNull();
    expect(document.querySelector(".nex-personal-network")).toHaveAttribute("data-connected", "true");
    expect(document.querySelector("#nex-draft-status")).toHaveTextContent(NEX_EXPERIENCE[lang].thoughtConnected);
    cleanup();
    open(lang === "fa" ? "/nex/" : "/en/nex/");
    expect(document.querySelector(".nex-orbit-thought")).toHaveTextContent(text);
    fireEvent.click(screen.getByRole("button", { name: lang === "fa" ? "ویرایش یادداشت" : "Edit note" }));
    expect(document.querySelector(".nex-orbit-thought")).toHaveTextContent(NEX_EXPERIENCE[lang].sampleNote.replace("\n", " "));
    expect(document.querySelector(".nex-personal-network")).toHaveAttribute("data-connected", "false");
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: NEX_COPY[lang].draftClear }));
    expect(document.querySelector(".nex-universe")).toHaveAttribute("data-personal", "false");
  });

  it("reacts to radio keyboard focus without adding a tab stop to the decorative octopus", () => {
    open();
    fireEvent.focus(screen.getByRole("radio", { name: NEX_COPY.fa.checklistLabel }));
    expect(document.querySelector(".nex-universe")).toHaveAttribute("data-mode", "checklist");
    expect(document.querySelector(".nex-live-eyes")).toBeInTheDocument();
    expect(document.querySelectorAll(".nex-reaching-arms path")).toHaveLength(3);
    expect(document.querySelector(".nex-thought-core")).toHaveAttribute("aria-hidden", "true");
    expect(document.querySelector(".nex-thought-core [tabindex]")).toBeNull();
  });

  it("links the footer to the page's top, above the masthead and hero", () => {
    open();
    const link = screen.getByRole("link", { name: NEX_EXPERIENCE.fa.backToHero });
    expect(link).toHaveAttribute("href", "#nex-top");
    expect(document.querySelector("#nex-top .nex-masthead")).toBeInTheDocument();
  });

  it("uses English coffee search examples and LTR result text in English", () => {
    open("/en/nex/");
    expect(screen.getByText("Coffee catch-up — at 12")).toHaveAttribute("dir", "ltr");
    expect(document.querySelector(".nex-search-experiment")).not.toHaveTextContent("كافه");
    fireEvent.click(screen.getByRole("button", { name: /Try: coffee 12/ }));
    expect(screen.getByRole("searchbox")).toHaveValue("coffee 12");
    expect(screen.getByRole("searchbox")).toHaveFocus();
    expect(document.querySelector(".nex-search-result")).toHaveAttribute("data-match", "true");
  });

  it.each(["fa", "en"] as const)("turns on the local AI illustration in %s, connects thoughts and turns off again", (lang) => {
    open(lang === "fa" ? "/nex/" : "/en/nex/");
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(document.querySelectorAll(".nex-ai-connections li")).toHaveLength(0);
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(document.querySelectorAll(".nex-ai-connections li")).toHaveLength(3);
    const first = document.querySelector(".nex-ai-seed")?.textContent;
    fireEvent.click(screen.getByRole("button", { name: lang === "fa" ? "یک فکر دیگر" : "Another thought" }));
    expect(document.querySelector(".nex-ai-seed")?.textContent).not.toBe(first);
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(document.querySelectorAll(".nex-ai-connections li")).toHaveLength(0);
    expect(localStorage.getItem(NEX_NOTE_KEY)).toBeNull();
  });

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

  it("keeps the masthead wordmark-only, without an animation playback control", () => {
    open();
    expect(document.querySelectorAll(".nex-brand svg")).toHaveLength(1);
    expect(document.querySelector(".nex-brand .nex-wordmark")).toBeInTheDocument();
    expect(document.querySelector(".nex-motion-toggle")).toBeNull();
    expect(document.querySelector(".nex-page")).not.toHaveAttribute("data-motion");
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
    expect(script).toContain('if (isNexHome && !calm && !sessionStorage.getItem("nex-intro"))');
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
    const mark = container.querySelector(".nex-thought-core svg");
    expect(mark?.querySelectorAll("circle")).toHaveLength(2);
    expect(container.querySelector(".nex-wordmark")?.querySelectorAll("circle")).toHaveLength(1);
  });
});
