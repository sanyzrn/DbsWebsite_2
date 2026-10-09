import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "../components/contact/ContactForm";
import { AppProvider } from "../lib/app";
import { dictionaries } from "../lib/i18n";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
});

function readyForm() {
  const setStatus = vi.fn();
  const view = render(
    <MemoryRouter initialEntries={["/en/contact"]}>
      <AppProvider>
        <ContactForm idPrefix="test" status="idle" setStatus={setStatus} truncated={false} setTruncated={vi.fn()} />
      </AppProvider>
    </MemoryRouter>
  );
  const f = dictionaries.en.contact.form;
  fireEvent.change(screen.getByLabelText(new RegExp(f.name)), { target: { value: "Saeed" } });
  fireEvent.change(screen.getByLabelText(new RegExp(f.email)), { target: { value: "test@example.com" } });
  fireEvent.change(screen.getByLabelText(new RegExp(f.message)), { target: { value: "Project enquiry" } });
  const form = screen.getByRole("button", { name: f.submit }).closest("form")!;
  return { ...view, form, setStatus };
}

describe("contact request lifecycle", () => {
  it("allows only one request while waiting for the anti-spam timing gate", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);
    const { form, setStatus } = readyForm();
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(setStatus).toHaveBeenCalledWith("sending");
    expect(fetchMock).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTimeAsync(2000));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(setStatus).toHaveBeenLastCalledWith("delivered");
  });

  it("does not send after closing the form during the initial wait", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { form, unmount, setStatus } = readyForm();
    fireEvent.submit(form);
    unmount();
    await act(async () => vi.advanceTimersByTimeAsync(2000));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(setStatus).toHaveBeenCalledTimes(1);
  });

  it("aborts on close and ignores a late success response", async () => {
    let resolveRequest!: (response: unknown) => void;
    const fetchMock = vi.fn(() => new Promise((resolve) => { resolveRequest = resolve; }));
    vi.stubGlobal("fetch", fetchMock);
    const { form, unmount, setStatus } = readyForm();
    await act(async () => vi.advanceTimersByTimeAsync(2000));
    fireEvent.submit(form);
    const signal = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].signal!;
    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => resolveRequest({ ok: true, json: async () => ({ ok: true }) }));
    expect(setStatus).toHaveBeenCalledTimes(1);
    expect(setStatus).toHaveBeenLastCalledWith("sending");
  });
});
