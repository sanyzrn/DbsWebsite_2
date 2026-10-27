/** Product facts of the NexaChatAI page (/nexachatai); the landing copy is in landing.ts. Persian first; keep both languages in step. */
import type { Lang } from "../i18n";

export const NEXACHAT_BUY_URL = "https://rtl-theme.com/?p=322159";
export const NEXACHAT_VERSION = "1.7.9";

export type NexaChatCopy = {
  seoTitle: string;
  seoDescription: string;
  ctaBuy: string;
  ctaReport: string;
  versionLine: string;
  features: { title: string; items: { name: string; text: string }[] };
  forWho: { title: string; items: { name: string; text: string }[] };
  steps: { title: string; items: { name: string; text: string }[] };
  needs: { title: string; items: string[] };
  faq: { title: string; items: { q: string; a: string }[] };
};

const fa: NexaChatCopy = {
  seoTitle: "NexaChatAI؛ چت‌بات هوش مصنوعی وردپرس | DbsStudio",
  seoDescription: "دستیار هوشمند فارسی وردپرس که از دانش کسب‌وکار شما پاسخ می‌دهد؛ دمو زنده، چت زنده، ربات بله و تلگرام، دستیار فروش ووکامرس.",
  ctaBuy: "خرید و دانلود از راست‌چین",
  ctaReport: "گزارش مشکل",
  versionLine: `نسخهٔ ${NEXACHAT_VERSION} · وردپرس ۵٫۶ به بالا · PHP 7.4 به بالا`,
  features: {
    title: "چه کارهایی می‌کند",
    items: [
      { name: "راه‌اندازی در پنج مرحله", text: "جادوگر فارسی با ذخیرهٔ خودکار. تا منتشر نکرده‌اید، برای بازدیدکننده دیده نمی‌شود." },
      { name: "پاسخ از دانش شما", text: "متن، پرسش‌های متداول، PDF، Word و صفحه‌های سایت؛ منبع پاسخ زیر آن نمایش داده می‌شود." },
      { name: "هر مدل هوش مصنوعی", text: "OpenAI، Gemini، Claude، OpenRouter، هر نقطهٔ سازگار با OpenAI یا وب‌هوک امضاشده. بدون کلید هم با بانک پرسش و پاسخ کار می‌کند." },
      { name: "فارسی و راست‌چین کامل", text: "ویجت و پنل مدیریت، تاریخ شمسی و جهت متن هر پیام." },
      { name: "چت زنده و پیام‌رسان", text: "تحویل گفتگو به اپراتور، پاسخ از بله و تلگرام، و ربات بله و تلگرام برای مشتری‌ها." },
      { name: "دستیار فروش ووکامرس", text: "کارت محصول با قیمت و موجودی واقعی، پیگیری سفارش، کوپن هوشمند با سقف و یادآور سبد با پیامک." },
    ],
  },
  forWho: {
    title: "برای چه سایت‌هایی",
    items: [
      { name: "فروشگاه‌های ووکامرس", text: "معرفی محصول، پیگیری سفارش، پاسخ دربارهٔ ارسال و بازگشت کالا." },
      { name: "شرکت‌ها و آژانس‌های خدماتی", text: "پاسخ پرسش‌های پیش از خرید و دریافت درخواست مشاوره." },
      { name: "کلینیک‌ها و داروخانه‌ها", text: "ساعت کاری، خدمات و ثبت گزارش عوارض دارویی؛ فقط ابزار گردآوری، نه جایگزین نظر پزشک یا داروساز." },
      { name: "آموزشگاه‌ها و سایت‌های محتوایی", text: "اطلاعات دوره‌ها و پاسخ از مقاله‌های خودتان با ذکر منبع." },
    ],
  },
  steps: {
    title: "شروع کار",
    items: [
      { name: "نصب", text: "فایل zip را از «افزونه‌ها ← افزودن ← بارگذاری» نصب و فعال کنید." },
      { name: "هویت و دانش", text: "اطلاعات کسب‌وکار و دانش اصلی را وارد کنید یا «یادگیری از سایت من» را روشن کنید." },
      { name: "اتصال", text: "ارائه‌دهنده و کلید API را بدهید و آزمون اتصال را بزنید، یا بدون هوش مصنوعی شروع کنید." },
      { name: "ظاهر و انتشار", text: "رنگ برند را تنظیم کنید، دستیار را در پیش‌نمایش امتحان کنید و منتشر کنید." },
    ],
  },
  needs: {
    title: "پیش‌نیازها و نکته‌ها",
    items: [
      "وردپرس ۵٫۶ یا بالاتر، PHP نسخهٔ ۷٫۴ یا بالاتر با mbstring و openssl.",
      "برای پاسخ هوشمند آزاد، کلید API یکی از ارائه‌دهنده‌ها لازم است؛ هزینهٔ مصرف با خود ارائه‌دهنده است و افزونه از هر پیام پولی نمی‌گیرد.",
      "سرور باید به ارائه‌دهنده برسد. برخی ارائه‌دهندگان سرورهای داخل ایران را رد می‌کنند؛ در این حالت هاست خارج از ایران یا یک دروازهٔ سازگار با OpenAI را استفاده کنید.",
      "پاسخ‌های هوش مصنوعی ممکن است اشتباه باشد؛ برای موضوع‌های حساس بازبینی کنید.",
      "افزونه هیچ داده‌ای به سازنده نمی‌فرستد: نه ردیابی، نه بررسی به‌روزرسانی.",
    ],
  },
  faq: {
    title: "پرسش‌های متداول",
    items: [
      { q: "بدون کلید API هم کار می‌کند؟", a: "بله. با گزینهٔ «بدون موتور هوش مصنوعی» فقط از بانک پرسش و پاسخ و دانش شما پاسخ می‌دهد و چیزی از سرور شما بیرون نمی‌رود." },
      { q: "هزینهٔ هر پیام چقدر است؟", a: "افزونه از هر پیام هزینه‌ای نمی‌گیرد. مصرف از حساب شما نزد ارائه‌دهندهٔ هوش مصنوعی کم می‌شود و تعرفه را همان سرویس تعیین می‌کند." },
      { q: "با ووکامرس، المنتور و گوتنبرگ سازگار است؟", a: "بله. ماژول ووکامرس قیمت و موجودی را از خود ووکامرس می‌خواند و با HPOS سازگار اعلام شده است. دکمهٔ شناور خودکار نمایش داده می‌شود و ویجت المنتور، بلوک گوتنبرگ و شورت‌کد هم هست." },
      { q: "مشکل یا پیشنهادی دارم.", a: "از صفحهٔ گزارش مشکل استفاده کنید؛ گزارش خصوصی است و مستقیم به من می‌رسد." },
    ],
  },
};

const en: NexaChatCopy = {
  seoTitle: "NexaChatAI: AI chatbot for WordPress | DbsStudio",
  seoDescription: "A Persian-first WordPress assistant that answers from your business knowledge: live demo, live chat, Bale and Telegram bot, WooCommerce sales assistant.",
  ctaBuy: "Get it on RTL-Theme",
  ctaReport: "Report a problem",
  versionLine: `Version ${NEXACHAT_VERSION} · WordPress 5.6+ · PHP 7.4+`,
  features: {
    title: "What it does",
    items: [
      { name: "Five-step setup", text: "A wizard with auto-saved progress. Invisible to visitors until you publish." },
      { name: "Answers from your knowledge", text: "Text, FAQ, PDF, Word and your own pages; the source is shown under each answer." },
      { name: "Any AI model", text: "OpenAI, Gemini, Claude, OpenRouter, any OpenAI-compatible endpoint or a signed webhook. Works without a key too, from the FAQ bank." },
      { name: "Persian and RTL, fully", text: "Widget and admin, Solar Hijri dates and per-message text direction." },
      { name: "Live chat and messengers", text: "Hand a conversation to an operator, answer from Bale and Telegram, and a Bale/Telegram bot for customers." },
      { name: "WooCommerce sales assistant", text: "Product cards with real price and stock, order tracking, a capped smart coupon and an SMS cart reminder." },
    ],
  },
  forWho: {
    title: "Who it is for",
    items: [
      { name: "WooCommerce shops", text: "Product help, order tracking, delivery and return questions." },
      { name: "Service companies and agencies", text: "Pre-sales questions and consultation requests." },
      { name: "Clinics and pharmacies", text: "Opening hours, services and adverse-reaction reports; a collection tool, not a substitute for a doctor or pharmacist." },
      { name: "Schools and content sites", text: "Course information and answers from your own articles, with sources." },
    ],
  },
  steps: {
    title: "Getting started",
    items: [
      { name: "Install", text: "Upload the zip under Plugins → Add New → Upload and activate it." },
      { name: "Identity and knowledge", text: "Enter your business details and core knowledge, or switch on “Learn from my website”." },
      { name: "Connect", text: "Give the provider and API key and run the connection test, or start without AI." },
      { name: "Look and publish", text: "Set the brand colour, try the assistant in the preview and publish." },
    ],
  },
  needs: {
    title: "Requirements and notes",
    items: [
      "WordPress 5.6+, PHP 7.4+ with mbstring and openssl.",
      "Free-form AI answers need an API key from one of the providers; usage is billed by the provider and the plugin charges nothing per message.",
      "The server must be able to reach the provider. Some providers refuse servers inside Iran; use a host outside Iran or an OpenAI-compatible gateway you can reach.",
      "AI answers can be wrong; review them for sensitive topics.",
      "The plugin sends nothing to its author: no tracking, no update check.",
    ],
  },
  faq: {
    title: "FAQ",
    items: [
      { q: "Does it work without an API key?", a: "Yes. With “No AI engine” it answers only from the FAQ bank and your knowledge, and nothing leaves your server." },
      { q: "What does each message cost?", a: "The plugin charges nothing per message. Usage comes off your account with the AI provider, at that provider's rates." },
      { q: "Does it work with WooCommerce, Elementor and Gutenberg?", a: "Yes. The WooCommerce module reads price and stock from WooCommerce and declares HPOS compatibility. The floating button appears automatically, and there is an Elementor widget, a Gutenberg block and a shortcode." },
      { q: "I have a problem or a suggestion.", a: "Use the problem-report page; the report is private and reaches me directly." },
    ],
  },
};

export const NEXACHAT_COPY: Record<Lang, NexaChatCopy> = { fa, en };
