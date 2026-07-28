/** Locale-aware calendar date for article cards/detail (ISO YYYY-MM-DD input). */
export function formatArticleDate(isoDate: string, lang: "fa" | "en"): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}
