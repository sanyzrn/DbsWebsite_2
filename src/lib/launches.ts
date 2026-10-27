/**
 * Temporary product landing pages. Their routes remain stable when real
 * product pages replace the placeholders.
 */
export const LAUNCH_PAGES = {
  nex: {
    name: "Nex",
    number: "01",
    copy: {
      fa: {
        label: "در حال ساخت",
        line: "جایی برای تمام چیزهایی که نمی‌خواهی فراموش کنی.",
        note: "داریم یک فضای تازه برای Nex می‌سازیم. به‌زودی اینجا جان می‌گیرد.",
        back: "بازگشت به استودیو",
        footer: "ایده‌ها در حرکت‌اند",
        seoTitle: "Nex | در حال ساخت | DbsStudio",
        seoDescription: "صفحه اختصاصی Nex در DbsStudio در حال آماده‌سازی است.",
      },
      en: {
        label: "Under construction",
        line: "A home for everything worth remembering.",
        note: "A new space for Nex is taking shape. This is only the beginning.",
        back: "Back to studio",
        footer: "Ideas in motion",
        seoTitle: "Nex | Coming Soon | DbsStudio",
        seoDescription: "The official Nex page at DbsStudio is under construction.",
      },
    },
  },
  nexahr: {
    name: "NexaHR",
    number: "02",
    copy: {
      fa: {
        label: "در حال ساخت",
        line: "تجربه‌ای انسانی‌تر از مدیریت منابع انسانی.",
        note: "صفحه اختصاصی NexaHR در حال شکل گرفتن است. به‌زودی جزئیات بیشتری می‌بینید.",
        back: "بازگشت به استودیو",
        footer: "ساختن، با نگاه به انسان‌ها",
        seoTitle: "NexaHR | در حال ساخت | DbsStudio",
        seoDescription: "صفحه اختصاصی سامانه منابع انسانی NexaHR در حال آماده‌سازی است.",
      },
      en: {
        label: "Under construction",
        line: "A more human way to manage work.",
        note: "We're building a dedicated space for NexaHR. More to come.",
        back: "Back to studio",
        footer: "Built around people",
        seoTitle: "NexaHR | Coming Soon | DbsStudio",
        seoDescription: "The official NexaHR product page is under construction.",
      },
    },
  },
  nexaslider: {
    name: "Nexa Slider",
    number: "04",
    copy: {
      fa: {
        label: "در حال ساخت",
        line: "هر حرکت، فرصتی برای یک روایت تازه.",
        note: "نمای تازه Nexa Slider در حال طراحی است. به‌زودی از این قاب رونمایی می‌کنیم.",
        back: "بازگشت به استودیو",
        footer: "در حال تغییر قاب",
        seoTitle: "Nexa Slider | در حال ساخت | DbsStudio",
        seoDescription: "صفحه اختصاصی افزونه Nexa Slider در حال آماده‌سازی است.",
      },
      en: {
        label: "Under construction",
        line: "Every transition tells a new story.",
        note: "A new showcase for Nexa Slider is taking shape. Stay tuned.",
        back: "Back to studio",
        footer: "The frame is shifting",
        seoTitle: "Nexa Slider | Coming Soon | DbsStudio",
        seoDescription: "The official Nexa Slider product page is under construction.",
      },
    },
  },
} as const;

export type LaunchSlug = keyof typeof LAUNCH_PAGES;

export function isLaunchSlug(value: string): value is LaunchSlug {
  return Object.prototype.hasOwnProperty.call(LAUNCH_PAGES, value);
}
