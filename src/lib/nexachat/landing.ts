/**
 * Landing-page copy of the NexaChatAI product page (/nexachatai), beyond the product facts in
 * copy.ts: hero, fictional store mock-up, numbers, dashboard shots and the case for buying.
 * Persian first; keep both languages in step.
 */
import type { Lang } from "../i18n";

export type Landing = {
  nav: { features: string; demo: string; dashboard: string; why: string; faq: string };
  eyebrow: string;
  headA: string;
  headB: string;
  lead: string;
  badges: string[];
  ctaDemo: string;
  heroHint: string;
  store: {
    brand: string;
    menu: string[];
    bannerTitle: string;
    bannerText: string;
    products: { name: string; price: string; tag?: string }[];
    userMsg: string;
    botMsg: string;
    source: string;
  };
  stats: { value: string; label: string }[];
  demo: { title: string; lead: string; hint: string; note: string; open: string };
  dashboard: { title: string; lead: string; placeholder: string; shots: { title: string; text: string }[] };
  why: { title: string; lead: string; items: { name: string; text: string }[] };
  closing: { title: string; text: string; sub: string };
  footer: { credit: string; report: string; backToTop: string };
  langSwitch: string;
};

const fa: Landing = {
  nav: { features: "امکانات", demo: "دمو", dashboard: "پنل مدیریت", why: "چرا NexaChatAI", faq: "پرسش‌ها" },
  eyebrow: "افزونهٔ هوش مصنوعی برای وردپرس",
  headA: "دستیاری که کسب‌وکارت را می‌شناسد",
  headB: "و شبانه‌روز به مشتری جواب می‌دهد.",
  lead: "NexaChatAI محصول‌ها، قیمت‌ها، ساعت کاری و فایل‌های تو را یاد می‌گیرد و به فارسی، با ذکر منبع، پاسخ می‌دهد. اگر چیزی را نداند، صادقانه می‌گوید و گفتگو را به یک انسان می‌سپارد.",
  badges: ["فارسی و راست‌چین کامل", "هر مدل هوش مصنوعی", "ووکامرس، بله و تلگرام", "داده‌ها روی سایت خودت"],
  ctaDemo: "با دمو زنده گفتگو کن",
  heroHint: "دستیار را گوشهٔ صفحه ببین و همین حالا چیزی بپرس.",
  store: {
    brand: "آواساند",
    menu: ["هدفون", "اسپیکر", "ساعت هوشمند", "پشتیبانی"],
    bannerTitle: "صدایی که شنیدنی است",
    bannerText: "ارسال رایگان بالای ۱٬۵۰۰٬۰۰۰ تومان",
    products: [
      { name: "هدفون نووا ۲", price: "۲٬۴۹۰٬۰۰۰", tag: "حذف نویز" },
      { name: "ایربادز ویو ایر", price: "۱٬۸۹۰٬۰۰۰" },
      { name: "اسپیکر ریتم ۳", price: "۱٬۲۹۰٬۰۰۰" },
    ],
    userMsg: "با بودجهٔ دو میلیون چه چیزی بخرم؟",
    botMsg: "ایربادز «ویو ایر» (۱٬۸۹۰٬۰۰۰ تومان) بهترین گزینه است؛ سبک و ضدعرق. اگر حذف نویز مهم‌تر است، «نووا ۲» را ببینید.",
    source: "کاتالوگ محصولات",
  },
  stats: [
    { value: "۵", label: "مرحله تا انتشار با جادوگر راه‌اندازی" },
    { value: "۴+", label: "ارائه‌دهندهٔ هوش مصنوعی، به‌علاوهٔ هر سرویس سازگار با OpenAI" },
    { value: "۲", label: "پیام‌رسان ایرانی و جهانی: بله و تلگرام" },
    { value: "۰", label: "کارمزد افزونه به‌ازای هر پیام" },
  ],
  demo: {
    title: "همین حالا امتحانش کن",
    lead: "این همان ویجت واقعی افزونه است با تم تیره، در یک فروشگاه فرضی به نام «آواساند». روی یکی از پرسش‌ها بزن تا دستیار باز شود و جواب بدهد، یا خودت بنویس.",
    hint: "دکمهٔ گوشهٔ پایین صفحه همان چیزی است که بازدیدکنندهٔ سایت تو می‌بیند.",
    note: "فروشگاه، محصول‌ها و قیمت‌ها کاملاً فرضی‌اند و پاسخ‌ها از پیش نوشته شده‌اند. در سایت واقعی، دستیار از دانش خودت و مدل انتخابی‌ات جواب می‌دهد.",
    open: "باز کردن دستیار",
  },
  dashboard: {
    title: "پنل مدیریتی که کار را دست خودت می‌دهد",
    lead: "همه‌چیز فارسی و راست‌چین، با داشبورد کیفیت، صندوق گفتگوها و گزارش سؤال‌هایی که دستیار نتوانسته جواب بدهد تا دانشش را هر هفته کامل‌تر کنی.",
    placeholder: "جای تصویر پنل",
    shots: [
      { title: "داشبورد", text: "وضعیت اتصال، تعداد گفتگوها و سلامت دستیار در یک نگاه." },
      { title: "دانش کسب‌وکار", text: "متن، پرسش‌های متداول، PDF، Word و صفحه‌های سایت در یک‌جا." },
      { title: "گفتگوها و کیفیت", text: "هر گفتگو را ببین، امتیاز بده و سؤال‌های بی‌پاسخ را پیدا کن." },
      { title: "چت زنده", text: "گفتگو را به اپراتور بسپار؛ از پنل یا از بله و تلگرام جواب بده." },
    ],
  },
  why: {
    title: "چرا یک افزونهٔ حرفه‌ای",
    lead: "یک ویجت چت ساده است. NexaChatAI یک لایهٔ کامل از ارتباط با مشتری است که برای کسب‌وکار فارسی‌زبان ساخته شده.",
    items: [
      { name: "پاسخ با منبع، نه حدس", text: "هر جواب از دانش خودت می‌آید و منبعش زیرش نشان داده می‌شود. اگر پاسخ را ندارد، می‌گوید." },
      { name: "داده‌ها مال خودت", text: "گفتگوها در پایگاه‌دادهٔ وردپرس خودت می‌مانند. افزونه ردیابی و بررسی به‌روزرسانی ندارد و کلید هوش مصنوعی هیچ‌وقت به مرورگر بازدیدکننده نمی‌رسد." },
      { name: "بدون قفل شدن روی یک سرویس", text: "OpenAI، Gemini، Claude، OpenRouter یا هر نقطهٔ سازگار. مدل را هر وقت خواستی عوض کن؛ هزینهٔ مصرف مستقیم با خود سرویس است." },
      { name: "از گفتگو تا فروش", text: "کارت محصول با قیمت و موجودی واقعی، پیگیری سفارش، کوپن هوشمند با سقف و یادآور سبد با پیامک." },
      { name: "انسان در حلقه", text: "چت زنده، ارجاع به اپراتور و خلاصهٔ هوشمند گفتگو، تا مشتری هیچ‌وقت در بن‌بست نماند." },
      { name: "به‌روزرسانی و پشتیبانی واقعی", text: "نسخه‌های پیاپی با گزارش تغییرات، و صفحهٔ گزارش مشکل که گزارش‌ها را خصوصی و مستقیم به سازنده می‌رساند." },
    ],
  },
  closing: {
    title: "دستیارت را امروز راه بینداز",
    text: "از نصب تا انتشار پنج مرحله بیشتر نیست. همین حالا دمو را امتحان کن و اگر مناسب بود، افزونه را از راست‌چین تهیه کن.",
    sub: "نسخهٔ جاری، وردپرس ۵٫۶ به بالا، PHP 7.4 به بالا",
  },
  footer: { credit: "ساختهٔ DbsStudio", report: "گزارش مشکل", backToTop: "بازگشت به بالا" },
  langSwitch: "English",
};

const en: Landing = {
  nav: { features: "Features", demo: "Demo", dashboard: "Admin", why: "Why NexaChatAI", faq: "FAQ" },
  eyebrow: "The AI assistant plugin for WordPress",
  headA: "An assistant that knows your business",
  headB: "and answers customers around the clock.",
  lead: "NexaChatAI learns your products, prices, opening hours and files, and answers in your customers' language with the source shown. When it does not know, it says so and hands the chat to a person.",
  badges: ["Persian and RTL, fully", "Any AI model", "WooCommerce, Bale and Telegram", "Your data stays on your site"],
  ctaDemo: "Chat with the live demo",
  heroHint: "Look at the corner of the page and ask something right now.",
  store: {
    brand: "Ava Sound",
    menu: ["Headphones", "Speakers", "Smartwatches", "Support"],
    bannerTitle: "Sound worth hearing",
    bannerText: "Free shipping above $30",
    products: [
      { name: "Nova 2 headphones", price: "$62", tag: "ANC" },
      { name: "Wave Air earbuds", price: "$47" },
      { name: "Rhythm 3 speaker", price: "$32" },
    ],
    userMsg: "What should I buy with a $40 budget?",
    botMsg: "The “Wave Air” earbuds ($47) fit best: light and sweat-proof. If noise cancelling matters more, look at “Nova 2”.",
    source: "Product catalogue",
  },
  stats: [
    { value: "5", label: "steps from install to publish with the setup wizard" },
    { value: "4+", label: "AI providers, plus any OpenAI-compatible service" },
    { value: "2", label: "messengers: Bale and Telegram" },
    { value: "0", label: "plugin fee per message" },
  ],
  demo: {
    title: "Try it right now",
    lead: "This is the plugin's real widget in its dark theme, on a fictional store called “Ava Sound”. Tap a question to open the assistant and get an answer, or type your own.",
    hint: "The button in the corner of the screen is what your site's visitors see.",
    note: "The store, products and prices are fictional and the answers are scripted. On a real site the assistant answers from your knowledge and the model you choose.",
    open: "Open the assistant",
  },
  dashboard: {
    title: "An admin panel that puts you in control",
    lead: "Fully localised, with a quality dashboard, a conversation inbox and a report of the questions the assistant could not answer, so its knowledge gets better every week.",
    placeholder: "Admin screenshot here",
    shots: [
      { title: "Dashboard", text: "Connection status, conversation counts and assistant health at a glance." },
      { title: "Business knowledge", text: "Text, FAQs, PDF, Word and site pages in one place." },
      { title: "Conversations and quality", text: "Read every chat, rate it and find the unanswered questions." },
      { title: "Live chat", text: "Hand a chat to an operator; reply from the panel or from Bale and Telegram." },
    ],
  },
  why: {
    title: "Why a professional plugin",
    lead: "A chat widget is simple. NexaChatAI is a full customer-communication layer built for Persian-speaking businesses.",
    items: [
      { name: "Answers with sources, not guesses", text: "Each answer comes from your knowledge and its source is shown beneath it. If it does not have the answer, it says so." },
      { name: "Your data is yours", text: "Conversations stay in your own WordPress database. The plugin has no tracking or update check, and the AI key never reaches a visitor's browser." },
      { name: "No lock-in to one service", text: "OpenAI, Gemini, Claude, OpenRouter or any compatible endpoint. Change models whenever you like; usage is billed by the service itself." },
      { name: "From chat to sale", text: "Product cards with real price and stock, order tracking, a capped smart coupon and an SMS cart reminder." },
      { name: "A human in the loop", text: "Live chat, operator handoff and an AI summary of the conversation, so customers never hit a dead end." },
      { name: "Real updates and support", text: "Regular releases with a changelog, and a problem-report page that sends reports privately and directly to the author." },
    ],
  },
  closing: {
    title: "Launch your assistant today",
    text: "It is five steps from install to publish. Try the demo now and, if it fits, get the plugin on RTL-Theme.",
    sub: "Current version, WordPress 5.6+, PHP 7.4+",
  },
  footer: { credit: "Made by DbsStudio", report: "Report a problem", backToTop: "Back to top" },
  langSwitch: "فارسی",
};

export const NEXACHAT_LANDING: Record<Lang, Landing> = { fa, en };

/**
 * Admin screenshots for the four "panel" cards, in the same order as `dashboard.shots`.
 * `null` shows a labelled placeholder. To use a picture, put it under public/images/nexachat/
 * and set its path here, e.g. "/images/nexachat/dashboard.webp" (about 1600 x 1000, WebP).
 */
export const NEXACHAT_SHOTS: (string | null)[] = [null, null, null, null];
