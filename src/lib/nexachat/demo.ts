/**
 * Scripted back end for the live NexaChatAI demo on /nexachat.
 *
 * The page runs the plugin's own widget (public/nexachat-demo/chatbot.js) with the plugin's own
 * configuration (widget-config.json, the output of the plugin's build_config() for a demo shop).
 * Only the server is replaced: requests to DEMO_REST are answered here from a small written
 * knowledge, so nothing is sent anywhere and no AI provider is involved.
 *
 * The widget talks to its REST base with POST requests (chat, suggest, feedback). Answers are
 * matched by keywords after the same Persian/Arabic normalisation the plugin applies to questions.
 */
import widgetConfig from "./widget-config.json";

export type DemoLang = "fa" | "en";

export const DEMO_REST = "/__nexachat-demo/";

type Source = { title: string };
type Entry = {
  id: string;
  /** Normalised keywords; the entry with the most hits answers. */
  keys: string[];
  reply: string;
  sources: Source[];
  /** Questions offered as follow-ups after this answer. */
  follow: string[];
};

type Knowledge = {
  entries: Entry[];
  fallback: { reply: string; follow: string[] };
  greeting: { reply: string; follow: string[] };
  starters: string[];
};

const FA: Knowledge = {
  starters: ["ساعت کاری فروشگاه چیست؟", "ارسال سفارش چند روز طول می‌کشد؟", "شرایط بازگشت کالا چیست؟", "یک هدفون بی‌سیم معرفی کن", "این دستیار چطور کار می‌کند؟"],
  greeting: {
    reply: "سلام! 👋 من دستیار نمایشی «فروشگاه نمونه» هستم. دربارهٔ ساعت کاری، ارسال، بازگشت کالا، پرداخت یا محصول‌ها بپرسید.",
    follow: ["ساعت کاری فروشگاه چیست؟", "ارسال سفارش چند روز طول می‌کشد؟", "یک هدفون بی‌سیم معرفی کن"],
  },
  fallback: {
    reply: "این گفتگو نمایشی است و فقط به چند پرسش آماده پاسخ می‌دهد. در سایت واقعی، دستیار از دانش خود شما و مدل هوش مصنوعی انتخابی‌تان پاسخ می‌دهد. یکی از پرسش‌های پیشنهادی را امتحان کنید.",
    follow: ["ساعت کاری فروشگاه چیست؟", "شرایط بازگشت کالا چیست؟", "این دستیار چطور کار می‌کند؟"],
  },
  entries: [
    {
      id: "hours",
      keys: ["ساعت", "کاری", "باز", "تعطیل", "پنجشنبه", "جمعه", "چه ساعتی"],
      reply: "فروشگاه شنبه تا چهارشنبه از ۹ تا ۱۸ و پنجشنبه از ۹ تا ۱۴ پاسخ‌گوست؛ جمعه‌ها تعطیل است. ثبت سفارش آنلاین در تمام ساعات شبانه‌روز ممکن است.",
      sources: [{ title: "ساعت کاری و تماس" }],
      follow: ["ارسال سفارش چند روز طول می‌کشد؟", "چطور با فروشگاه تماس بگیرم؟"],
    },
    {
      id: "shipping",
      keys: ["ارسال", "تحویل", "پست", "چند روز", "پیک", "هزینه ارسال", "رایگان"],
      reply: "سفارش‌های تهران ۱ تا ۲ روز کاری و شهرستان‌ها ۲ تا ۵ روز کاری تحویل می‌شوند. ارسال سفارش‌های بالای ۱٬۰۰۰٬۰۰۰ تومان رایگان است.",
      sources: [{ title: "شرایط ارسال" }],
      follow: ["شرایط بازگشت کالا چیست؟", "سفارشم را چطور پیگیری کنم؟"],
    },
    {
      id: "returns",
      keys: ["بازگشت", "مرجوع", "برگشت", "پس بدم", "تعویض", "عودت"],
      reply: "تا ۷ روز پس از تحویل می‌توانید کالا را برگردانید، به‌شرط آنکه بسته‌بندی و لوازم جانبی سالم باشد. اگر کالا با سفارش مغایرت داشته باشد، هزینهٔ برگشت با فروشگاه است.",
      sources: [{ title: "رویهٔ بازگشت کالا" }],
      follow: ["گارانتی محصولات چقدر است؟", "روش‌های پرداخت چیست؟"],
    },
    {
      id: "payment",
      keys: ["پرداخت", "درگاه", "کارت", "قسطی", "نقدی", "در محل"],
      reply: "پرداخت با درگاه بانکی انجام می‌شود. در تهران، پرداخت در محل هم امکان‌پذیر است.",
      sources: [{ title: "روش‌های پرداخت" }],
      follow: ["ارسال سفارش چند روز طول می‌کشد؟", "کد تخفیف دارید؟"],
    },
    {
      id: "tracking",
      keys: ["پیگیری", "سفارشم", "کد رهگیری", "کجاست", "وضعیت سفارش"],
      reply: "کد رهگیری بعد از ارسال با پیامک برایتان فرستاده می‌شود. در نسخهٔ ووکامرس افزونه، شمارهٔ سفارش و موبایل را همین‌جا در گفتگو وارد می‌کنید و وضعیت سفارش مستقیم از فروشگاه خوانده می‌شود.",
      sources: [{ title: "پیگیری سفارش" }],
      follow: ["شرایط بازگشت کالا چیست؟", "چطور با فروشگاه تماس بگیرم؟"],
    },
    {
      id: "product",
      keys: ["هدفون", "محصول", "پیشنهاد", "بی‌سیم", "بیسیم", "معرفی", "ساعت هوشمند", "قیمت"],
      reply: "هدفون بی‌سیم «نووا ۲»: ۲٬۴۹۰٬۰۰۰ تومان، باتری ۳۰ ساعته، حذف نویز فعال، موجود در انبار. ساعت هوشمند «پالس»: ۳٬۹۰۰٬۰۰۰ تومان، ضدآب، موجود. (محصول‌ها و قیمت‌ها نمونه‌اند.)",
      sources: [{ title: "کاتالوگ محصولات (نمونه)" }],
      follow: ["گارانتی محصولات چقدر است؟", "کد تخفیف دارید؟"],
    },
    {
      id: "warranty",
      keys: ["گارانتی", "ضمانت", "خدمات پس از فروش"],
      reply: "همهٔ محصولات ۱۸ ماه گارانتی دارند. برای استفاده از گارانتی، کد سفارش را به پشتیبانی بدهید.",
      sources: [{ title: "گارانتی و خدمات پس از فروش" }],
      follow: ["شرایط بازگشت کالا چیست؟", "چطور با فروشگاه تماس بگیرم؟"],
    },
    {
      id: "coupon",
      keys: ["تخفیف", "کد تخفیف", "کوپن", "ارزان"],
      reply: "با ماژول ووکامرس، افزونه می‌تواند به مشتریِ مردد یک کد تخفیف یک‌بارمصرف و محدود بدهد؛ سقف روزانه و درصد را شما تعیین می‌کنید. در این نمایش کد واقعی ساخته نمی‌شود.",
      sources: [{ title: "ماژول دستیار فروش ووکامرس" }],
      follow: ["این دستیار چطور کار می‌کند؟", "با انسان صحبت کنم"],
    },
    {
      id: "contact",
      keys: ["تماس", "تلفن", "شماره", "آدرس", "ایمیل", "پشتیبانی"],
      reply: "تلفن پشتیبانی: ۰۲۱-۱۲۳۴۵۶۷۸ (نمونه). ایمیل: support@example.com. آدرس: تهران، خیابان نمونه، پلاک ۱۰.",
      sources: [{ title: "ساعت کاری و تماس" }],
      follow: ["ساعت کاری فروشگاه چیست؟", "با انسان صحبت کنم"],
    },
    {
      id: "human",
      keys: ["اپراتور", "انسان", "کارشناس", "آدم", "صحبت کنم", "پشتیبان انسانی"],
      reply: "با ماژول «چت زنده»، گفتگو به یک اپراتور واقعی تحویل می‌شود: صف و ارجاع، پاسخ‌های آماده و خلاصهٔ هوشمند گفتگو را می‌بیند و می‌تواند از بله یا تلگرام هم پاسخ بدهد. این نمایش اپراتور ندارد.",
      sources: [{ title: "ماژول چت زنده" }],
      follow: ["این دستیار چطور کار می‌کند؟", "ساعت کاری فروشگاه چیست؟"],
    },
    {
      id: "about",
      keys: ["دستیار", "چطور کار", "نکسا", "nexachat", "هوش مصنوعی", "افزونه", "چیست", "کیستی", "تو کی"],
      reply: "من نسخهٔ نمایشی NexaChatAI هستم. افزونه اطلاعات کسب‌وکار شما را (متن، پرسش‌های متداول، PDF و Word) یاد می‌گیرد و به مشتری‌ها به فارسی پاسخ می‌دهد؛ با OpenAI، Gemini، Claude یا هر سرویس سازگار کار می‌کند و منبع پاسخ را زیرش نشان می‌دهد.",
      sources: [{ title: "معرفی NexaChatAI" }],
      follow: ["کد تخفیف دارید؟", "با انسان صحبت کنم"],
    },
  ],
};

const EN: Knowledge = {
  starters: ["What are your opening hours?", "How long does delivery take?", "What is the return policy?", "Recommend wireless headphones", "How does this assistant work?"],
  greeting: {
    reply: "Hello! 👋 I am the demo assistant of “Sample Store”. Ask about opening hours, delivery, returns, payment or products.",
    follow: ["What are your opening hours?", "How long does delivery take?", "Recommend wireless headphones"],
  },
  fallback: {
    reply: "This conversation is a demo and only answers a few prepared questions. On a real site the assistant answers from your own knowledge and the AI model you choose. Try one of the suggested questions.",
    follow: ["What are your opening hours?", "What is the return policy?", "How does this assistant work?"],
  },
  entries: [
    {
      id: "hours",
      keys: ["hour", "open", "close", "closed", "time", "friday", "thursday", "when"],
      reply: "Saturday to Wednesday 9:00–18:00 and Thursday 9:00–14:00; closed on Fridays. Online orders are accepted around the clock.",
      sources: [{ title: "Opening hours and contact" }],
      follow: ["How long does delivery take?", "How can I contact the store?"],
    },
    {
      id: "shipping",
      keys: ["deliver", "shipping", "ship", "days", "courier", "free delivery", "postage"],
      reply: "Tehran orders arrive in 1–2 working days, other cities in 2–5. Delivery is free for orders over 1,000,000 toman.",
      sources: [{ title: "Delivery terms" }],
      follow: ["What is the return policy?", "How do I track my order?"],
    },
    {
      id: "returns",
      keys: ["return", "refund", "exchange", "send back", "money back"],
      reply: "You can return an item within 7 days of delivery if the packaging and accessories are intact. If the item does not match the order, the store pays for the return.",
      sources: [{ title: "Return policy" }],
      follow: ["How long is the warranty?", "Which payment methods do you accept?"],
    },
    {
      id: "payment",
      keys: ["pay", "payment", "card", "cash", "installment", "checkout"],
      reply: "Payment is made through a bank gateway. In Tehran, cash on delivery is also possible.",
      sources: [{ title: "Payment methods" }],
      follow: ["How long does delivery take?", "Do you have a discount code?"],
    },
    {
      id: "tracking",
      keys: ["track", "tracking", "my order", "where is", "order status"],
      reply: "A tracking code is sent by SMS after dispatch. With the plugin's WooCommerce module you type the order number and mobile here in the chat and the status is read straight from the shop.",
      sources: [{ title: "Order tracking" }],
      follow: ["What is the return policy?", "How can I contact the store?"],
    },
    {
      id: "product",
      keys: ["headphone", "headphones", "product", "recommend", "wireless", "watch", "price", "smartwatch"],
      reply: "Wireless headphones “Nova 2”: 2,490,000 toman, 30-hour battery, active noise cancelling, in stock. Smartwatch “Pulse”: 3,900,000 toman, waterproof, in stock. (Products and prices are samples.)",
      sources: [{ title: "Product catalogue (sample)" }],
      follow: ["How long is the warranty?", "Do you have a discount code?"],
    },
    {
      id: "warranty",
      keys: ["warranty", "guarantee", "after sales", "after-sales"],
      reply: "All products carry an 18-month warranty. Give the order number to support to use it.",
      sources: [{ title: "Warranty and after-sales service" }],
      follow: ["What is the return policy?", "How can I contact the store?"],
    },
    {
      id: "coupon",
      keys: ["discount", "coupon", "voucher", "promo", "cheaper", "offer"],
      reply: "With the WooCommerce module the plugin can give a hesitating customer a single-use, capped discount code; you set the daily limit and the percentage. No real code is created in this demo.",
      sources: [{ title: "WooCommerce sales assistant module" }],
      follow: ["How does this assistant work?", "Can I talk to a person?"],
    },
    {
      id: "contact",
      keys: ["contact", "phone", "call", "address", "email", "support", "reach"],
      reply: "Support phone: +98 21 1234 5678 (sample). Email: support@example.com. Address: 10 Sample Street, Tehran.",
      sources: [{ title: "Opening hours and contact" }],
      follow: ["What are your opening hours?", "Can I talk to a person?"],
    },
    {
      id: "human",
      keys: ["person", "human", "agent", "operator", "talk to someone", "real person"],
      reply: "With the Live chat module the conversation is handed to a real operator: they see the queue, canned replies and an AI summary of the conversation, and can answer from Bale or Telegram too. This demo has no operator.",
      sources: [{ title: "Live chat module" }],
      follow: ["How does this assistant work?", "What are your opening hours?"],
    },
    {
      id: "about",
      keys: ["assistant", "how does", "nexachat", "ai", "plugin", "what is", "who are you", "work"],
      reply: "I am the demo of NexaChatAI. The plugin learns your business (text, FAQ, PDF and Word files) and answers customers in their language; it works with OpenAI, Gemini, Claude or any compatible service and shows the source under each answer.",
      sources: [{ title: "About NexaChatAI" }],
      follow: ["Do you have a discount code?", "Can I talk to a person?"],
    },
  ],
};

export const DEMO_KNOWLEDGE: Record<DemoLang, Knowledge> = { fa: FA, en: EN };

/** The same folding the plugin applies to questions: Arabic letters/digits to Persian, no marks. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u200c\u200e\u200f]/g, "")
    .replace(/\p{Mn}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type DemoAnswer = { reply: string; sources: Source[]; follow: string[]; id: string };

/** Answer a question from the scripted knowledge. */
export function answerDemo(lang: DemoLang, question: string): DemoAnswer {
  const kb = DEMO_KNOWLEDGE[lang];
  const q = normalize(question);
  if (!q) return { id: "fallback", reply: kb.fallback.reply, sources: [], follow: kb.fallback.follow };
  if (/^(سلام|درود|hi|hello|hey)\b/.test(q) && q.split(" ").length <= 3) {
    return { id: "greeting", reply: kb.greeting.reply, sources: [], follow: kb.greeting.follow };
  }
  let best: Entry | undefined;
  let bestScore = 0;
  for (const entry of kb.entries) {
    let score = 0;
    for (const key of entry.keys) {
      if (q.includes(normalize(key))) score += normalize(key).length > 4 ? 2 : 1;
    }
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  if (!best) return { id: "fallback", reply: kb.fallback.reply, sources: [], follow: kb.fallback.follow };
  return { id: best.id, reply: best.reply, sources: best.sources, follow: best.follow };
}

/** Widget configuration for the demo: the plugin's own output, with the transport pointed at the script. */
export function buildDemoConfig(lang: DemoLang): Record<string, unknown> {
  const base = (widgetConfig as Record<DemoLang, Record<string, unknown>>)[lang];
  return {
    ...base,
    restUrl: DEMO_REST,
    ajaxUrl: "",
    nonce: "",
    preview: true,
    assistantName: lang === "fa" ? "دستیار نمایشی" : "Demo assistant",
    orgName: lang === "fa" ? "فروشگاه نمونه" : "Sample Store",
    fontStack: "'Vazirmatn Variable', 'Archivo Variable', Tahoma, sans-serif",
    memory: { persist: false, days: 0, threads: false, notice: false },
    features: { ...(base.features as Record<string, boolean>), faq: true, feedback: true },
    products: [],
    proactiveText: "",
  };
}

type Pending = { answer?: DemoAnswer; lastQuestion: string };

/**
 * Replace window.fetch for DEMO_REST requests until the returned function is called.
 * Other requests pass through untouched.
 */
export function installDemoBackend(lang: DemoLang, delayMs = 700): () => void {
  const previous = window.fetch;
  const original = previous.bind(window);
  const state: Pending = { lastQuestion: "" };
  let counter = 0;

  const json = (body: unknown, wait: number) =>
    new Promise<Response>((resolve) => {
      window.setTimeout(
        () => resolve(new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } })),
        wait
      );
    });

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const at = url.indexOf(DEMO_REST);
    if (at === -1) return original(input, init);
    const route = url.slice(at + DEMO_REST.length).split("?")[0];
    const params = new URLSearchParams(typeof init?.body === "string" ? init.body : "");

    if (route === "chat" || route === "preview-chat") {
      const message = params.get("message") ?? "";
      const answer = answerDemo(lang, message);
      state.lastQuestion = message;
      state.answer = answer;
      counter += 1;
      return json(
        {
          reply: answer.reply,
          source: answer.sources.length ? "knowledge" : "fallback",
          sources: answer.sources,
          log_id: counter,
          log_token: "demo",
        },
        delayMs
      );
    }
    if (route === "suggest") {
      const follow = state.answer?.follow ?? DEMO_KNOWLEDGE[lang].fallback.follow;
      return json({ items: follow.map((question) => ({ question })) }, Math.min(delayMs, 250));
    }
    if (route === "feedback") return json({ ok: true }, 0);
    return json({}, 0);
  }) as typeof window.fetch;

  return () => {
    window.fetch = previous;
  };
}
