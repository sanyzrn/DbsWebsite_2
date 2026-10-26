import type { Lang } from "./i18n";

type Text = Record<Lang, string>;

/** Twelve things Nex does, for the landing page; the features page has the full list. */
export const NEX_HIGHLIGHTS: { icon: string; title: Text; text: Text }[] = [
  { icon: "capture", title: { fa: "ثبت در یک لحظه", en: "Capture in a moment" }, text: { fa: "یادداشت، چک‌لیست، لینک، صدا، عکس یا فایل؛ بی‌دکمهٔ ذخیره. از کاشی تنظیمات سریع، ویجت یا هم‌رسانی هر برنامه هم.", en: "Notes, checklists, links, voice, photos or files, with no save button. Also from a Quick Settings tile, a widget or any app’s share menu." } },
  { icon: "bell", title: { fa: "یادآور سر وقت", en: "Reminders on time" }, text: { fa: "یک‌باره یا تکرارشونده؛ اعلان تا وقتی ببینی‌اش می‌ماند و «انجام شد» و «یک ساعت دیگر» دارد.", en: "One-off or repeating. The notification stays until you see it, with Done and In an hour." } },
  { icon: "repeat", title: { fa: "کارهای تکراری", en: "Things that recur" }, text: { fa: "اجاره، بیمه، قرص و آب؛ موعد بعدی هر کدام، تقویم ماهانه و جمع پرداخت‌های ۳۰ روز آینده.", en: "Rent, insurance, pills and water: each next date, a monthly calendar and the next 30 days’ payments." } },
  { icon: "letter", title: { fa: "نامه به آینده", en: "A note for later" }, text: { fa: "یادداشتی بنویس که فردا، ماه بعد یا سال بعد برسد؛ تا آن روز پنهان می‌ماند.", en: "Write a note that arrives tomorrow, next month or next year. Until then it stays out of sight." } },
  { icon: "library", title: { fa: "کتابخانهٔ مرتب", en: "A tidy library" }, text: { fa: "برچسب‌های رنگی، رشته‌های موضوعی، بایگانی با تاریخ برگشت و سطل زبالهٔ ۳۰ روزه با واگرد.", en: "Coloured tags, topic threads, an archive with return dates and a 30-day trash with undo." } },
  { icon: "search", title: { fa: "جست‌وجوی سریع", en: "Fast search" }, text: { fa: "با تکه‌ای از یک کلمه، فیلتر نوع و برچسب و تاریخ؛ و اگر بخواهی بر اساس معنا.", en: "With part of a word, filters for type, tag and date, and by meaning if you like." } },
  { icon: "ai", title: { fa: "هوش مصنوعی اختیاری", en: "Optional AI" }, text: { fa: "خلاصه، ترجمهٔ فارسی و انگلیسی، شرح عکس و دستیاری که دربارهٔ یادداشت‌هایت جواب می‌دهد؛ فقط وقتی بخواهی.", en: "Summaries, Persian–English translation, photo descriptions and an assistant that answers about your notes, only when you ask." } },
  { icon: "vault", title: { fa: "خزانهٔ خصوصی", en: "A private vault" }, text: { fa: "رمزها، کارت‌های بانکی و پیام‌های خصوصی، رمزگذاری‌شده و پشت اثر انگشت.", en: "Passwords, bank cards and private messages, encrypted and behind your fingerprint." } },
  { icon: "cycle", title: { fa: "چرخه", en: "Cycle" }, text: { fa: "پیش‌بینی پریود بعدی و روزهای باروری، با ویجتی محتاطانه؛ روی همین گوشی.", en: "The next period and fertile window, with a discreet widget, on this phone." } },
  { icon: "files", title: { fa: "فایل و رسانه", en: "Files and media" }, text: { fa: "PDF، ویدئو و صدا در خود برنامه؛ فایل ورد و متن هم به یادداشت قابل ویرایش تبدیل می‌شود.", en: "PDF, video and audio inside the app; Word and text files become editable notes." } },
  { icon: "backup", title: { fa: "پشتیبان و قفل", en: "Backups and lock" }, text: { fa: "نقطهٔ بازیابی خودکار، کپی در پوشه یا گوگل‌درایو، قفل برنامه با اثر انگشت.", en: "Automatic restore points, copies to a folder or Google Drive, and an app lock." } },
  { icon: "look", title: { fa: "فارسی، شمسی، روشن و تیره", en: "Persian, English, light and dark" }, text: { fa: "فارسی و انگلیسی، تقویم شمسی و میلادی، تم‌ها، رنگ تأکیدی و آیکون دلخواه.", en: "Persian and English, both calendars, themes, accent colours and app icons." } },
];

export const NEX_HIGHLIGHTS_COPY: Record<Lang, { eyebrow: string; title: string; lead: string; more: string }> = {
  fa: { eyebrow: "امکانات در یک نگاه", title: "هرچه برای یک ذهن آرام لازم است.", lead: "بدون حساب کاربری، بدون اینترنت اجباری؛ همه‌چیز روی گوشی خودت.", more: "همهٔ امکانات" },
  en: { eyebrow: "At a glance", title: "Everything a calm mind needs.", lead: "No account and no internet required. Everything stays on your phone.", more: "Every feature" },
};
