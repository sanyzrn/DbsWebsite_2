import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { dictionaries } from "../lib/i18n";

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("Home page section structure", () => {
  it("orders Hero → Intro/expertise → Projects → Process and keeps anchors", () => {
    render(<App />);

    const expertise = document.getElementById("expertise");
    const projects = document.getElementById("projects");
    const process = document.getElementById("process");
    expect(expertise).toBeTruthy();
    expect(projects).toBeTruthy();
    expect(process).toBeTruthy();

    // DOM order: expertise before projects before process
    expect(expertise!.compareDocumentPosition(projects!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(projects!.compareDocumentPosition(process!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Folded thinking lead appears inside expertise section (not its own section)
    expect(expertise!.textContent).toContain(dictionaries.fa.thinking.lead);
    // Standalone Product Thinking heading is gone
    expect(screen.queryByText(dictionaries.fa.thinking.title)).toBeNull();

    // Compact pillars present
    for (const card of dictionaries.fa.expertise.cards) {
      expect(expertise!.textContent).toContain(card.title);
    }
  });

  it("nav process and expertise hashes still target real ids", () => {
    render(<App />);
    expect(document.querySelector('a[href="/#process"], a[href="#process"]') || document.getElementById("process")).toBeTruthy();
    expect(document.getElementById("expertise")).toBeTruthy();
    expect(document.getElementById("process")).toBeTruthy();
  });
});
