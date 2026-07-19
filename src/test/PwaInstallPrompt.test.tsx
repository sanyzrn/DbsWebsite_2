import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PwaInstallPrompt from "../components/PwaInstallPrompt";
import { AppProvider } from "../lib/app";
import { dictionaries } from "../lib/i18n";

const DISMISS_KEY = "sz-pwa-install-dismissed";

function renderPrompt() {
  return render(
    <MemoryRouter>
      <AppProvider>
        <PwaInstallPrompt />
      </AppProvider>
    </MemoryRouter>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.removeItem(DISMISS_KEY);
});

beforeEach(() => {
  localStorage.removeItem(DISMISS_KEY);
});

describe("PwaInstallPrompt", () => {
  it("stays hidden until beforeinstallprompt and dismisses permanently", () => {
    renderPrompt();
    expect(screen.queryByRole("dialog")).toBeNull();

    const prompt = vi.fn(async () => undefined);
    const event = new Event("beforeinstallprompt") as Event & {
      prompt: typeof prompt;
      userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
      preventDefault: () => void;
    };
    Object.assign(event, {
      prompt,
      userChoice: Promise.resolve({ outcome: "dismissed" as const }),
    });

    fireEvent(window, event);

    expect(screen.getByRole("dialog", { name: dictionaries.fa.pwa.installTitle })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: dictionaries.fa.pwa.dismiss }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(localStorage.getItem(DISMISS_KEY)).toBe("1");
  });

  it("does not show again after a prior dismissal", () => {
    localStorage.setItem(DISMISS_KEY, "1");
    renderPrompt();
    const event = new Event("beforeinstallprompt");
    Object.assign(event, {
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: "dismissed" }),
    });
    fireEvent(window, event);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
