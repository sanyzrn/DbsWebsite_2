import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Repeat2 } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import { NEX_COPY } from "../../lib/nex";
import { calendarMonth, calendarParts, dateOnly, isoDate, localToday, nextMonthlyOccurrences, type DemoCalendar } from "../../lib/nexCalendar";

const dateFormatters = new Map<string, Intl.DateTimeFormat>();
function formatDate(date: Date, calendar: DemoCalendar, lang: Lang, monthOnly = false) {
  const key = `${calendar}-${lang}-${monthOnly}`;
  let formatter = dateFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : "en-US", { calendar, timeZone: "UTC", year: "numeric", month: "long", ...(monthOnly ? {} : { day: "numeric" }) });
    dateFormatters.set(key, formatter);
  }
  return formatter.format(date);
}
export default function ReminderCalendar({ lang }: { lang: Lang }) {
  const c = NEX_COPY[lang];
  const [today, setToday] = useState<string | null>(null);
  const [calendar, setCalendar] = useState<DemoCalendar>("persian");
  const [day, setDay] = useState(21);
  useEffect(() => {
    function updateToday() { setToday(localToday()); }
    updateToday();
    // Refresh after a midnight crossing and on returning to this page.
    document.addEventListener("visibilitychange", updateToday);
    const timer = setInterval(updateToday, 60000);
    return () => { document.removeEventListener("visibilitychange", updateToday); clearInterval(timer); };
  }, []);
  const dates = useMemo(() => today ? nextMonthlyOccurrences(dateOnly(today), calendar, day) : [], [today, calendar, day]);
  const month = useMemo(() => today ? calendarMonth(dateOnly(today), calendar) : null, [today, calendar]);
  const numberFormatter = useMemo(() => new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US"), [lang]);
  const number = (value: number) => numberFormatter.format(value);
  return <div className="nex-calendar-demo" id="nex-calendar">
    <div className="nex-demo-kicker"><CalendarDays size={16} aria-hidden="true" />{c.calendarTitle}</div>
    <p className="nex-demo-lead">{c.calendarLead}</p>
    <div className="nex-calendar-controls">
      <label>{c.calendarType}<select value={calendar} onChange={(event) => setCalendar(event.target.value as DemoCalendar)} disabled={!today}><option value="persian">{c.calendarPersian}</option><option value="gregory">{c.calendarGregorian}</option></select></label>
      <label>{c.calendarDay}<select value={day} onChange={(event) => setDay(Number(event.target.value))} disabled={!today}>{Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1}>{number(i + 1)}</option>)}<option value={0}>{c.calendarLastDay}</option></select></label>
    </div>
    <div className="nex-calendar-body">{today && month ? <>
      <div className="nex-calendar-paper">
        <div className="nex-calendar-heading"><span>{formatDate(dateOnly(today), calendar, lang, true)}</span><span>{c.calendarToday}: {number(calendarParts(dateOnly(today), calendar).day)}</span></div>
        <div className="nex-calendar-grid" role="table" aria-label={formatDate(dateOnly(today), calendar, lang, true)}>
          <div className="nex-calendar-row" role="row">{c.calendarWeekdays.map((name, i) => <span role="columnheader" key={name} className="nex-weekday" aria-label={c.calendarDayNames[i]}>{name}</span>)}</div>
          {Array.from({ length: Math.ceil((month.leading + month.days.length) / 7) }, (_, week) => <div className="nex-calendar-row" role="row" key={week}>{Array.from({ length: 7 }, (_, weekday) => {
            const date = month.days[week * 7 + weekday - month.leading];
            if (!date) return <span key={weekday} role="cell" />;
            const iso = isoDate(date);
            const due = dates.some((occurrence) => isoDate(occurrence) === iso);
            return <span role="cell" key={weekday} className="nex-calendar-cell" data-today={iso === today} data-due={due} aria-current={iso === today ? "date" : undefined}><time dateTime={iso}>{number(calendarParts(date, calendar).day)}</time>{due && <Repeat2 size={9} aria-label={c.reminderLabel} />}</span>;
          })}</div>)}
        </div>
      </div>
      <p className="nex-fine-print">{c.calendarLive}</p>
      <p className="nex-sr-only" role="status">{c.calendarNext}: {formatDate(dates[0], calendar, lang)}</p>
      <details className="nex-calendar-occurrences" open><summary>{c.calendarNext}<Repeat2 size={14} aria-hidden="true" /></summary><ol tabIndex={0} aria-label={c.calendarNext}>{dates.map((date) => <li key={isoDate(date)}><time dateTime={isoDate(date)}><span>{formatDate(date, "persian", lang)}</span><small>{formatDate(date, "gregory", lang)}</small></time></li>)}</ol></details>
    </> : <p className="nex-calendar-placeholder">{c.calendarLoading}</p>}</div>
    <p className="nex-fine-print">{c.calendarShortMonth}</p><p className="nex-demo-disclaimer">{c.calendarDemo}</p>
  </div>;
}
