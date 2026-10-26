import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import IssuesPage from "../pages/IssuesPage";
import { AppProvider } from "../lib/app";
import { dictionaries, ISSUE_KIND_IDS, ISSUE_PRODUCT_IDS } from "../lib/i18n";
import { issuePrefillFromQuery } from "../lib/issues";
import { listPrerenderPaths, resolveSeoForPath } from "../lib/seo";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
});

const f = dictionaries.en.issues.form;

function renderPage(entry = "/en/issues") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <AppProvider>
        <Routes>
          <Route path="/en/issues" element={<IssuesPage />} />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  );
}

function fill() {
  fireEvent.change(screen.getByLabelText(new RegExp(f.name)), { target: { value: "Reporter" } });
  fireEvent.change(screen.getByLabelText(new RegExp(f.email)), { target: { value: "me@example.com" } });
  fireEvent.change(screen.getByLabelText(new RegExp(f.message)), { target: { value: "It crashes when I open About." } });
}

describe("problem report page (/issues)", () => {
  it("lists the four products and an 'other' entry, and the report kinds", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1, name: dictionaries.en.issues.title })).toBeTruthy();
    const product = screen.getByLabelText(new RegExp(`^${f.product}`)) as HTMLSelectElement;
    const labels = [...product.options].map((o) => o.text);
    for (const name of ["NexaChatAI (WordPress plugin)", "Nex (Android)", "Nex (Windows)", "NexaHR"]) {
      expect(labels).toContain(name);
    }
    expect(product.options).toHaveLength(ISSUE_PRODUCT_IDS.length);
    const kind = screen.getByLabelText(new RegExp(`^${f.kind}`)) as HTMLSelectElement;
    expect(kind.options).toHaveLength(ISSUE_KIND_IDS.length);
  });

  it("is prefilled from a product link and shows the security note only for security reports", () => {
    renderPage("/en/issues?product=nex-android&version=2.0.1&kind=security");
    expect((screen.getByLabelText(new RegExp(`^${f.product}`)) as HTMLSelectElement).value).toBe("nex-android");
    expect((screen.getByLabelText(new RegExp(`^${f.kind}`)) as HTMLSelectElement).value).toBe("security");
    expect((screen.getByLabelText(new RegExp(`^${f.version}`)) as HTMLInputElement).value).toBe("2.0.1");
    expect(screen.getByText(f.securityNote)).toBeTruthy();
    fireEvent.change(screen.getByLabelText(new RegExp(`^${f.kind}`)), { target: { value: "bug" } });
    expect(screen.queryByText(f.securityNote)).toBeNull();
  });

  it("ignores unknown or unsafe query values", () => {
    const params = new URLSearchParams("product=evil&kind=x&version=<script>");
    expect(issuePrefillFromQuery(params)).toEqual({});
    expect(issuePrefillFromQuery(new URLSearchParams("product=NEXAHR&version=1.7.8"))).toEqual({ product: "nexahr", version: "1.7.8" });
  });

  it("asks for the required fields and sends nothing while they are missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderPage();
    fireEvent.submit(screen.getByRole("button", { name: f.submit }).closest("form")!);
    expect(screen.getAllByText(f.required)).toHaveLength(3);
    await act(async () => vi.advanceTimersByTimeAsync(3000));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts the report to /api/issue.php with product, kind, version and environment", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);
    renderPage("/en/issues?product=nexachatai&version=1.7.8");
    fill();
    fireEvent.change(screen.getByLabelText(new RegExp(`^${f.environment}`)), { target: { value: "WordPress 6.8, PHP 8.2" } });
    fireEvent.submit(screen.getByRole("button", { name: f.submit }).closest("form")!);
    await act(async () => vi.advanceTimersByTimeAsync(2100));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/issue.php");
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({
      product: "nexachatai",
      kind: "bug",
      version: "1.7.8",
      environment: "WordPress 6.8, PHP 8.2",
      email: "me@example.com",
    });
    expect(body.elapsedMs).toBeGreaterThanOrEqual(2000);
    expect(screen.getByText(f.deliveredTitle)).toBeTruthy();
  });

  it("does not call the server when the honeypot is filled", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { container } = renderPage();
    fill();
    fireEvent.change(container.querySelector('input[name="website"]')!, { target: { value: "http://spam.example" } });
    fireEvent.submit(screen.getByRole("button", { name: f.submit }).closest("form")!);
    await act(async () => vi.advanceTimersByTimeAsync(3000));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("tells the visitor when the hourly limit is reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({ ok: false, error: "rate_limited" }) }));
    renderPage();
    fill();
    fireEvent.submit(screen.getByRole("button", { name: f.submit }).closest("form")!);
    await act(async () => vi.advanceTimersByTimeAsync(2100));
    expect(screen.getByText(f.rateLimitedTitle)).toBeTruthy();
  });

  it("shows an error, not a success, when the server fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({ ok: false, error: "bale_delivery_failed" }) }));
    renderPage();
    fill();
    fireEvent.submit(screen.getByRole("button", { name: f.submit }).closest("form")!);
    await act(async () => vi.advanceTimersByTimeAsync(2100));
    expect(screen.getByText(f.errorTitle)).toBeTruthy();
    expect(screen.queryByText(f.deliveredTitle)).toBeNull();
  });

  it("is a prerendered, indexable route in both locales with its own title", () => {
    const paths = listPrerenderPaths();
    expect(paths).toContain("/issues");
    expect(paths).toContain("/en/issues");
    for (const lang of ["fa", "en"] as const) {
      const seo = resolveSeoForPath(lang === "fa" ? "/issues" : "/en/issues");
      expect(seo.title).toBe(dictionaries[lang].seo.issues.title);
      expect(seo.title.length).toBeLessThanOrEqual(60);
      expect(seo.description.length).toBeLessThanOrEqual(155);
    }
  });
});
