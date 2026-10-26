import type { Lang } from "./i18n";

type Text = Record<Lang, string>;

/** One real screenshot of the app, as shipped in public/images/nex/screens. */
export interface NexScreen {
  id: string;
  lang: Lang;
  theme: "light" | "dark";
  title: Text;
  text: Text;
  alt: Text;
}

/**
 * Ten screens of Nex 2.3.5, rendered from the app itself with sample notes.
 * Each file exists at 540 and 1080 pixels wide; both are 1080 × 2400 in shape.
 */
export const NEX_SCREENS: NexScreen[] = [
  {
    id: "fa_1_home_light", lang: "fa", theme: "light",
    title: { fa: "همه‌چیز در یک جریان آرام", en: "Everything in one calm stream" },
    text: {
      fa: "یادداشت، چک‌لیست، عکس و یادآور، کنار هم و از جدید به قدیم. سنجاق‌ها بالا می‌مانند و برچسب‌های رنگی با یک لمس فیلتر می‌کنند.",
      en: "Notes, checklists, photos and reminders side by side, newest first. Pins stay on top and coloured tags filter with one tap.",
    },
    alt: { fa: "صفحهٔ اصلی نکس به فارسی، تم روشن", en: "Nex home screen in Persian, light theme" },
  },
  {
    id: "fa_2_note_light", lang: "fa", theme: "light",
    title: { fa: "هوش مصنوعی، فقط وقتی بخواهی", en: "AI, only when you ask" },
    text: {
      fa: "یک لمس روی «شرح تصویر» و نکس می‌گوید در عکس چه هست. خلاصه، ترجمه و پیشنهاد برچسب هم کنار همین یادداشت‌اند.",
      en: "One tap on Describe image and Nex tells you what is in the photo. Summary, translation and tag ideas sit beside the same note.",
    },
    alt: { fa: "یادداشت عکس‌دار با شرح هوش مصنوعی، به فارسی", en: "A photo note with an AI description, in Persian" },
  },
  {
    id: "fa_3_recurring_light", lang: "fa", theme: "light",
    title: { fa: "کارهایی که هر بار برمی‌گردند", en: "The things that come back round" },
    text: {
      fa: "آب هر دو ساعت، اجاره هر ماه، بیمه هر سال. نکس موعد بعدی هر کدام را می‌شمارد و با یک تیک، نوبت بعدی را می‌چیند.",
      en: "Water every two hours, rent every month, insurance every year. Nex counts down to each one, and a single tick moves it to the next time.",
    },
    alt: { fa: "صفحهٔ موارد تکرارشونده به فارسی", en: "Recurring items screen in Persian" },
  },
  {
    id: "fa_4_library_light", lang: "fa", theme: "light",
    title: { fa: "کتابخانه‌ای که مرتب می‌ماند", en: "A library that stays tidy" },
    text: {
      fa: "بایگانی، زمان‌بندی‌شده‌ها، برچسب‌ها، رشته‌ها و سطل زباله در یک صفحه؛ همراه با فضایی که یادداشت‌ها و عکس‌ها روی گوشی گرفته‌اند.",
      en: "Archive, scheduled notes, tags, threads and trash on one page, with the space your notes and photos take on the phone.",
    },
    alt: { fa: "صفحهٔ کتابخانهٔ نکس به فارسی", en: "Nex library screen in Persian" },
  },
  {
    id: "fa_5_tools_light", lang: "fa", theme: "light",
    title: { fa: "ابزارهای خصوصی، پشت قفل", en: "Private tools, behind a lock" },
    text: {
      fa: "رمزها، کارت‌های بانکی و پیام‌های خصوصی، رمزگذاری‌شده روی همین گوشی؛ با تولیدکنندهٔ رمز و ماژول چرخه.",
      en: "Passwords, bank cards and private messages, encrypted on this phone, with a password generator and the Cycle module.",
    },
    alt: { fa: "صفحهٔ ابزارها و خزانهٔ خصوصی به فارسی", en: "Tools and private vault screen in Persian" },
  },
  {
    id: "fa_6_home_dark", lang: "fa", theme: "dark",
    title: { fa: "تم تیره برای شب‌ها", en: "Dark mode for late nights" },
    text: {
      fa: "همان نظم و همان سرعت، با رنگ‌هایی که چشم را خسته نمی‌کنند. حالت خودکار هم با تنظیم گوشی هماهنگ می‌شود.",
      en: "The same order and speed in colours that are easy on the eyes. Automatic mode follows your phone’s setting.",
    },
    alt: { fa: "صفحهٔ اصلی نکس به فارسی، تم تیره", en: "Nex home screen in Persian, dark theme" },
  },
  {
    id: "fa_7_cycle_dark", lang: "fa", theme: "dark",
    title: { fa: "چرخه؛ آرام و روی گوشی تو", en: "Cycle, calm and on your phone" },
    text: {
      fa: "روزهای مانده تا پریود بعدی، دورهٔ باروری و جمله‌ای مهربان برای هر روز. داده‌های چرخه روی همین گوشی می‌مانند.",
      en: "Days until the next period, the fertile window and a kind line for each day. Cycle data stays on this phone.",
    },
    alt: { fa: "ماژول چرخه به فارسی، تم تیره", en: "The Cycle module in Persian, dark theme" },
  },
  {
    id: "en_1_home_light", lang: "en", theme: "light",
    title: { fa: "به انگلیسی هم همان‌قدر روان", en: "Just as natural in English" },
    text: {
      fa: "تمام برنامه چپ‌به‌راست هم کار می‌کند؛ همان جریان، همان برچسب‌ها و همان یادآورها.",
      en: "The whole app reads left to right too, with the same stream, tags and reminders.",
    },
    alt: { fa: "صفحهٔ اصلی نکس به انگلیسی، تم روشن", en: "Nex home screen in English, light theme" },
  },
  {
    id: "en_2_note_light", lang: "en", theme: "light",
    title: { fa: "خلاصه با یک لمس", en: "A summary in one tap" },
    text: {
      fa: "هوش مصنوعی نکس یادداشت بلند را در چند خط خلاصه می‌کند؛ خود یادداشت همان‌طور که نوشته‌ای می‌ماند.",
      en: "Nex AI condenses a long note into a few lines. The note itself stays exactly as you wrote it.",
    },
    alt: { fa: "یادداشت با خلاصهٔ هوش مصنوعی، به انگلیسی", en: "A note with an AI summary, in English" },
  },
  {
    id: "en_3_recurring_dark", lang: "en", theme: "dark",
    title: { fa: "تکرارشونده‌ها در تم تیره", en: "Recurring, in the dark" },
    text: {
      fa: "عقب‌افتاده‌ها، امروز و هفت روز آینده با یک نگاه؛ به شکل فهرست یا تقویم.",
      en: "Overdue, today and the next seven days at a glance, as a list or a calendar.",
    },
    alt: { fa: "صفحهٔ موارد تکرارشونده به انگلیسی، تم تیره", en: "Recurring items screen in English, dark theme" },
  },
];

export const NEX_SCREENS_COPY: Record<Lang, {
  eyebrow: string; title: string; lead: string; filterLabel: string; filters: Record<"all" | Lang, string>;
  themes: Record<"light" | "dark", string>; previous: string; next: string; trackLabel: string; note: string;
}> = {
  fa: {
    eyebrow: "خود نکس، همان‌طور که هست",
    title: "ده صفحه از خود برنامه.\nهمان که روی گوشی‌ات می‌بینی.",
    lead: "از صفحهٔ اصلی تا خزانه و چرخه؛ به فارسی و انگلیسی، در تم روشن و تیره. ورق بزن.",
    filterLabel: "زبان تصویرها",
    filters: { all: "همه", fa: "فارسی", en: "English" },
    themes: { light: "روشن", dark: "تیره" },
    previous: "تصویر قبلی",
    next: "تصویر بعدی",
    trackLabel: "تصویرهای برنامه",
    note: "تصویرهای واقعی نکس 2.3.5. یادداشت‌ها، عکس‌ها و نتیجه‌های هوش مصنوعی داخلشان نمونه‌اند.",
  },
  en: {
    eyebrow: "Nex itself, as it is",
    title: "Ten screens from the app.\nExactly what you’ll see on your phone.",
    lead: "From the home screen to the vault and Cycle, in Persian and English, light and dark. Swipe through.",
    filterLabel: "Screenshot language",
    filters: { all: "All", fa: "فارسی", en: "English" },
    themes: { light: "Light", dark: "Dark" },
    previous: "Previous screenshot",
    next: "Next screenshot",
    trackLabel: "App screenshots",
    note: "Real screenshots of Nex 2.3.5. The notes, photos and AI results in them are samples.",
  },
};
