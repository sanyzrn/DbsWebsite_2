/** Date-only, UTC-noon arithmetic: no DST drift and no calendar dependency. */
export type DemoCalendar = "persian" | "gregory";
export type CalendarParts = { year: number; month: number; day: number };
const formatters = {
  persian: new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", { year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC" }),
  gregory: new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", { year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC" }),
};
export function calendarParts(date: Date, calendar: DemoCalendar): CalendarParts {
  const parts = formatters[calendar].formatToParts(date);
  const read = (name: string) => Number(parts.find((part) => part.type === name)?.value);
  return { year: read("year"), month: read("month"), day: read("day") };
}
export function dateOnly(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Invalid date");
  const date = new Date(`${value}T12:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error("Invalid date");
  return date;
}
export function isoDate(date: Date) { return date.toISOString().slice(0, 10); }
export function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** Mirrors the app's anchored month-day rule: short months clamp, later ones recover. */
export function nextMonthlyOccurrences(start: Date, calendar: DemoCalendar, day: number, count = 10): Date[] {
  if (!Number.isInteger(day) || day < 0 || day > 31 || !Number.isInteger(count) || count < 1 || count > 24 || !Number.isFinite(start.getTime())) throw new Error("Invalid recurrence");
  const results: Date[] = [];
  let cursor = dateOnly(isoDate(start));
  // At most two years; each month contributes one occurrence. Intl supplies leap years.
  for (let i = 0; i < 800 && results.length < count; i++) {
    const current = calendarParts(cursor, calendar);
    const next = new Date(cursor.getTime() + 86400000);
    const tomorrow = calendarParts(next, calendar);
    const lastDay = tomorrow.month !== current.month || tomorrow.year !== current.year;
    if (day === 0 ? lastDay : current.day === day || (lastDay && current.day < day)) results.push(cursor);
    cursor = next;
  }
  if (results.length !== count) throw new Error("Recurrence range exceeded");
  return results;
}

export function calendarMonth(date: Date, calendar: DemoCalendar) {
  const current = calendarParts(date, calendar);
  let first = dateOnly(isoDate(date));
  for (let i = 1; i < current.day; i++) first = new Date(first.getTime() - 86400000);
  const days: Date[] = [];
  let cursor = first;
  for (let i = 0; i < 32; i++) {
    const parts = calendarParts(cursor, calendar);
    if (parts.month !== current.month || parts.year !== current.year) break;
    days.push(cursor);
    cursor = new Date(cursor.getTime() + 86400000);
  }
  return { days, leading: (first.getUTCDay() + 1) % 7 };
}
