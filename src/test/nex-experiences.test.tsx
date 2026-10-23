import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { calendarMonth, calendarParts, dateOnly, isoDate, nextMonthlyOccurrences } from "../lib/nexCalendar";
import { highlightRanges, NEX_DEMO_NOTES, searchDemoNotes } from "../lib/nexDemoSearch";
import { normalizeNexDemo } from "../lib/nexExperience";
import { NEX_COPY } from "../lib/nex";
import ReminderCalendar from "../components/nex/ReminderCalendar";
import PrivacyExplorer from "../components/nex/PrivacyExplorer";
import DayStory from "../components/nex/DayStory";

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe("A searchable fictional library", () => {
  it("contains 48 distinct bilingual notes without visitor data", () => {
    expect(NEX_DEMO_NOTES).toHaveLength(48);
    expect(new Set(NEX_DEMO_NOTES.map((n) => n.id)).size).toBe(48);
    expect(NEX_DEMO_NOTES.every((n) => n.fa && n.en && n.tag.fa && n.tag.en)).toBe(true);
  });
  it("finds Arabic letter/digit variants, diacritics and tags", () => {
    expect(searchDemoNotes("كَافه ١٢", "fa").map((n) => n.id)).toEqual(["demo-01"]);
    expect(searchDemoNotes("coffee 12", "en").map((n) => n.id)).toEqual(["demo-01"]);
    expect(searchDemoNotes("سفر", "fa").length).toBeGreaterThan(4);
    expect(searchDemoNotes("unrelated", "en")).toEqual([]);
    expect(normalizeNexDemo("يـادداشتِ ۱۲")).toBe(normalizeNexDemo("یادداشت 12"));
  });
  it("maps highlighted matches to original text without changing its letters", () => {
    const text = "قرار كافه — ساعت ۱۲";
    const ranges = highlightRanges(text, "کافه 12");
    expect(ranges.map(([a, b]) => text.slice(a, b))).toEqual(["كافه", "۱۲"]);
    expect(highlightRanges("coffee coffee", "COFFEE")).toEqual([[0, 6], [7, 13]]);
  });
});

describe("Month-day recurrence", () => {
  it("returns the 31st after February and clamps April without drifting", () => {
    expect(nextMonthlyOccurrences(dateOnly("2026-01-31"), "gregory", 31, 4).map(isoDate)).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30"]);
  });
  it("handles Gregorian leap February", () => {
    expect(nextMonthlyOccurrences(dateOnly("2028-02-01"), "gregory", 31, 2).map(isoDate)).toEqual(["2028-02-29", "2028-03-31"]);
  });
  it("handles leap Esfand and the Persian new year", () => {
    expect(nextMonthlyOccurrences(dateOnly("2025-03-01"), "persian", 30, 3).map(isoDate)).toEqual(["2025-03-20", "2025-04-19", "2025-05-20"]);
    expect(calendarParts(dateOnly("2025-03-21"), "persian")).toEqual({ year: 1404, month: 1, day: 1 });
  });
  it("restores Persian day 31 after the short half of the year", () => {
    const dates = nextMonthlyOccurrences(dateOnly("2026-09-01"), "persian", 31);
    const parts = dates.map((d) => calendarParts(d, "persian"));
    expect(parts[0]).toEqual({ year: 1405, month: 6, day: 31 });
    expect(parts[1]).toEqual({ year: 1405, month: 7, day: 30 });
    expect(parts[6]).toEqual({ year: 1405, month: 12, day: 29 });
    expect(parts[7]).toEqual({ year: 1406, month: 1, day: 31 });
  });
  it("supports last-day schedules and does not return a past occurrence", () => {
    const dates = nextMonthlyOccurrences(dateOnly("2026-01-22"), "gregory", 0, 3);
    expect(dates.map(isoDate)).toEqual(["2026-01-31", "2026-02-28", "2026-03-31"]);
    expect(nextMonthlyOccurrences(dateOnly("2026-01-22"), "gregory", 21, 1).map(isoDate)).toEqual(["2026-02-21"]);
  });
  it("uses a Saturday-first calendar grid and exact date-only validation", () => {
    expect(calendarMonth(dateOnly("2026-01-31"), "gregory").leading).toBe(5);
    expect(calendarMonth(dateOnly("2028-02-15"), "gregory").days).toHaveLength(29);
    expect(() => dateOnly("2026-02-30")).toThrow();
    expect(() => nextMonthlyOccurrences(dateOnly("2026-01-01"), "persian", 32)).toThrow();
  });
});

describe("Product demonstrations", () => {
  it("shows ten dates and recalculates the calendar/day controls", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 0, 31, 12));
    const { container } = render(<ReminderCalendar lang="en" />);
    fireEvent.change(screen.getByRole("combobox", { name: NEX_COPY.en.calendarType }), { target: { value: "gregory" } });
    fireEvent.change(screen.getByRole("combobox", { name: NEX_COPY.en.calendarDay }), { target: { value: "31" } });
    const dates = [...container.querySelectorAll(".nex-calendar-occurrences time")].map((time) => time.getAttribute("datetime"));
    expect(dates).toHaveLength(10);
    expect(dates.slice(0, 3)).toEqual(["2026-01-31", "2026-02-28", "2026-03-31"]);
    expect(screen.getByText(NEX_COPY.en.calendarDemo)).toBeVisible();
  });
  it("starts from a stable server shell instead of prerendering a stale today", () => {
    const html = renderToString(<ReminderCalendar lang="fa" />);
    expect(html).toContain(NEX_COPY.fa.calendarLoading);
    expect(html).not.toContain("nex-calendar-cell");
    expect(html).toContain("disabled");
  });
  it("explains cloud transfer, readable backups and vault isolation on selection", () => {
    const { container } = render(<PrivacyExplorer lang="fa" />);
    for (const i of [2, 3, 4]) {
      fireEvent.click(screen.getByRole("button", { name: NEX_COPY.fa.privacyChoices[i] }));
      expect(container.querySelector(".nex-privacy-explanation")).toHaveTextContent(NEX_COPY.fa.privacyDescriptions[i]);
      expect(container.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);
    }
    expect(screen.getByRole("link", { name: NEX_COPY.fa.privacyPolicy })).toHaveAttribute("href", "https://github.com/sanyzrn/DbsNex/blob/main/apps/client/assets/privacy/fa.md");
  });
  it("lets keyboard users choose a story moment, while all story copy remains readable", () => {
    const { container } = render(<DayStory lang="en" />);
    const night = screen.getByRole("button", { name: `22:00 — ${NEX_COPY.en.storyScreens[3]}` });
    fireEvent.click(night);
    expect(night).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".nex-day-story")).toHaveAttribute("data-active", "3");
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.getByText(NEX_COPY.en.screenshotPreview)).toBeVisible();
    expect(container.querySelector('img[src*="/guide/"]')).toBeNull();
  });
});
