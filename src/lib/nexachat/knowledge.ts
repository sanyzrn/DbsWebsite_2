/**
 * Written knowledge of the demo shop (a fictional audio and wearables store, "Ava Sound").
 * Every shop, product, price and phone number here is invented for the demo.
 */

export type Source = { title: string };
export type Entry = {
  id: string;
  /** Keywords; the entry with the most hits answers. */
  keys: string[];
  reply: string;
  sources: Source[];
  /** Questions offered as follow-ups after this answer. */
  follow: string[];
};

export type Knowledge = {
  entries: Entry[];
  fallback: { reply: string; follow: string[] };
  greeting: { reply: string; follow: string[] };
  /** Sample questions shown on the page. */
  starters: string[];
};

export const FA: Knowledge = {
  starters: [
    "ساعت کاری فروشگاه چیست؟",
    "ارسال سفارش چند روز طول می‌کشد؟",
    "شرایط بازگشت کالا چیست؟",
    "یک هدفون بی‌سیم معرفی کن",
    "با بودجهٔ دو میلیون چه چیزی بخرم؟",
    "گارانتی محصولات چقدر است؟",
    "خرید قسطی دارید؟",
    "سفارشم را چطور پیگیری کنم؟",
    "کد تخفیف دارید؟",
    "با یک کارشناس صحبت کنم",
    "این دستیار چطور کار می‌کند؟",
    "اطلاعات من کجا ذخیره می‌شود؟",
  ],
  greeting: {
    reply: "سلام! 👋 من دستیار هوشمند «آواساند» هستم. دربارهٔ هدفون، اسپیکر، ساعت هوشمند، ارسال، گارانتی و پرداخت بپرسید.",
    follow: ["یک هدفون بی‌سیم معرفی کن", "ارسال سفارش چند روز طول می‌کشد؟", "گارانتی محصولات چقدر است؟"],
  },
  fallback: {
    reply:
      "این گفتگو نمایشی است و فقط به پرسش‌های آمادهٔ فروشگاه فرضی «آواساند» پاسخ می‌دهد. در سایت واقعی، دستیار از دانش خود شما و مدل هوش مصنوعی انتخابی‌تان جواب می‌دهد. یکی از پرسش‌های پیشنهادی را امتحان کنید.",
    follow: ["ساعت کاری فروشگاه چیست؟", "شرایط بازگشت کالا چیست؟", "این دستیار چطور کار می‌کند؟"],
  },
  entries: [
    {
      id: "hours",
      keys: ["ساعت کاری", "ساعت کار", "باز هستید", "تعطیل", "پنجشنبه", "جمعه", "چه ساعتی"],
      reply: "فروشگاه و پشتیبانی شنبه تا چهارشنبه ۹ تا ۱۸ و پنجشنبه ۹ تا ۱۴ پاسخ‌گو هستند؛ جمعه‌ها تعطیل است. ثبت سفارش آنلاین در تمام ساعات شبانه‌روز باز است.",
      sources: [{ title: "ساعت کاری و تماس" }],
      follow: ["چطور با فروشگاه تماس بگیرم؟", "ارسال سفارش چند روز طول می‌کشد؟"],
    },
    {
      id: "shipping",
      keys: ["ارسال", "تحویل", "پست", "چند روز", "هزینه ارسال", "رایگان", "شهرستان"],
      reply:
        "سفارش‌های تهران ۱ تا ۲ روز کاری و شهرستان‌ها ۲ تا ۵ روز کاری تحویل می‌شوند. ارسال سفارش‌های بالای ۱٬۵۰۰٬۰۰۰ تومان رایگان است و زیر این مبلغ ۹۰٬۰۰۰ تومان هزینهٔ ارسال دارد.",
      sources: [{ title: "شرایط ارسال" }],
      follow: ["پیک فوری در تهران دارید؟", "سفارشم را چطور پیگیری کنم؟"],
    },
    {
      id: "express",
      keys: ["پیک", "فوری", "امروز", "همان روز", "سریع"],
      reply: "در تهران، سفارش‌هایی که تا ساعت ۱۴ ثبت شوند با پیک فوری همان روز تحویل می‌شوند؛ هزینهٔ آن ۱۵۰٬۰۰۰ تومان است. برای شهرستان‌ها پیک فوری نداریم.",
      sources: [{ title: "شرایط ارسال" }],
      follow: ["ارسال سفارش چند روز طول می‌کشد؟", "روش‌های پرداخت چیست؟"],
    },
    {
      id: "returns",
      keys: ["بازگشت", "مرجوع", "برگشت", "پس بدم", "تعویض", "عودت", "پس بگیرم"],
      reply:
        "تا ۷ روز پس از تحویل می‌توانید کالا را برگردانید، به‌شرط آنکه بسته‌بندی و لوازم جانبی سالم باشد. اگر کالا با سفارش مغایرت داشته باشد یا خراب برسد، هزینهٔ برگشت با ماست.",
      sources: [{ title: "رویهٔ بازگشت کالا" }],
      follow: ["گارانتی محصولات چقدر است؟", "روش‌های پرداخت چیست؟"],
    },
    {
      id: "payment",
      keys: ["پرداخت", "درگاه", "کارت", "نقدی", "در محل", "پول"],
      reply: "پرداخت با درگاه بانکی انجام می‌شود. در تهران، پرداخت در محل (کارت‌خوان همراه پیک) هم امکان‌پذیر است.",
      sources: [{ title: "روش‌های پرداخت" }],
      follow: ["خرید قسطی دارید؟", "کد تخفیف دارید؟"],
    },
    {
      id: "installment",
      keys: ["قسط", "اقساط", "چک", "اعتباری", "خرید اعتباری"],
      reply:
        "برای خرید بالای ۳٬۰۰۰٬۰۰۰ تومان، پرداخت قسطی ۴ ماهه بدون پیش‌پرداخت داریم. کارمزد در صفحهٔ پرداخت پیش از تأیید نهایی نمایش داده می‌شود.",
      sources: [{ title: "خرید قسطی" }],
      follow: ["روش‌های پرداخت چیست؟", "ساعت هوشمند «پالس» را معرفی کن"],
    },
    {
      id: "tracking",
      keys: ["پیگیری", "سفارشم", "کد رهگیری", "کجاست", "وضعیت سفارش", "رهگیری"],
      reply:
        "کد رهگیری بعد از ارسال با پیامک برایتان می‌آید. با ماژول ووکامرس افزونه، شمارهٔ سفارش و موبایل را همین‌جا می‌نویسید و وضعیت واقعی سفارش را می‌بینید. (در این دمو سفارشی وجود ندارد.)",
      sources: [{ title: "پیگیری سفارش" }],
      follow: ["ارسال سفارش چند روز طول می‌کشد؟", "با یک کارشناس صحبت کنم"],
    },
    {
      id: "headphone",
      keys: ["هدفون", "هدست", "نووا", "بی‌سیم", "بیسیم", "حذف نویز"],
      reply:
        "هدفون بی‌سیم «نووا ۲»: ۲٬۴۹۰٬۰۰۰ تومان، باتری ۳۰ ساعته، حذف نویز فعال، بلوتوث ۵٫۳. در رنگ‌های مشکی و سرمه‌ای موجود است. اگر بودجه‌تان کمتر است، ایربادز «ویو ایر» را هم ببینید.",
      sources: [{ title: "کاتالوگ آواساند (نمونه)" }],
      follow: ["ایربادز «ویو ایر» را معرفی کن", "با بودجهٔ دو میلیون چه چیزی بخرم؟"],
    },
    {
      id: "earbuds",
      keys: ["ایربادز", "ایرپاد", "ویو ایر", "گوشی بی‌سیم", "داخل گوش"],
      reply: "ایربادز «ویو ایر»: ۱٬۸۹۰٬۰۰۰ تومان، ۸ ساعت شنیدن (۲۸ ساعت با قاب شارژ)، ضدعرق IPX5. فقط در رنگ سفید موجود است و ۴ عدد در انبار مانده.",
      sources: [{ title: "کاتالوگ آواساند (نمونه)" }],
      follow: ["با بودجهٔ دو میلیون چه چیزی بخرم؟", "گارانتی محصولات چقدر است؟"],
    },
    {
      id: "budget",
      keys: ["بودجه", "میلیون", "ارزان", "اقتصادی", "مناسب", "چی بخرم", "چه چیزی بخرم", "پیشنهاد"],
      reply:
        "با دو میلیون تومان بهترین گزینه ایربادز «ویو ایر» (۱٬۸۹۰٬۰۰۰) است؛ سبک و ضدعرق، مناسب ورزش و رفت‌وآمد. اگر حذف نویز برایتان مهم است، «نووا ۲» با ۲٬۴۹۰٬۰۰۰ تومان گزینهٔ بعدی است. می‌خواهید تفاوتشان را مقایسه کنم؟",
      sources: [{ title: "کاتالوگ آواساند (نمونه)" }],
      follow: ["یک هدفون بی‌سیم معرفی کن", "خرید قسطی دارید؟"],
    },
    {
      id: "speaker",
      keys: ["اسپیکر", "بلندگو", "ریتم", "بلوتوث", "پخش‌کننده"],
      reply: "اسپیکر بلوتوثی «ریتم ۳»: ۱٬۲۹۰٬۰۰۰ تومان، ضدآب IPX7، ۱۲ ساعت پخش و امکان جفت‌شدن با اسپیکر دوم برای صدای استریو. موجود است.",
      sources: [{ title: "کاتالوگ آواساند (نمونه)" }],
      follow: ["گارانتی محصولات چقدر است؟", "پیک فوری در تهران دارید؟"],
    },
    {
      id: "watch",
      keys: ["ساعت هوشمند", "پالس", "اسمارت", "مچی", "ضربان"],
      reply: "ساعت هوشمند «پالس»: ۳٬۹۰۰٬۰۰۰ تومان، ضدآب، ضربان‌سنج و خواب‌سنج، ۷ روز شارژدهی. با اندروید و iOS سازگار است. فعلاً فقط رنگ مشکی موجود است.",
      sources: [{ title: "کاتالوگ آواساند (نمونه)" }],
      follow: ["خرید قسطی دارید؟", "گارانتی محصولات چقدر است؟"],
    },
    {
      id: "warranty",
      keys: ["گارانتی", "ضمانت", "خدمات پس از فروش", "خراب شد", "تعمیر"],
      reply: "همهٔ محصولات ۱۸ ماه گارانتی شرکتی دارند. برای استفاده از گارانتی، کد سفارش را به پشتیبانی بدهید؛ جایگزینی یا تعمیر در مرکز خدمات تهران انجام می‌شود.",
      sources: [{ title: "گارانتی و خدمات پس از فروش" }],
      follow: ["شرایط بازگشت کالا چیست؟", "با یک کارشناس صحبت کنم"],
    },
    {
      id: "coupon",
      keys: ["تخفیف", "کد تخفیف", "کوپن", "حراج", "ارزان‌تر"],
      reply:
        "با ماژول ووکامرس، افزونه می‌تواند به مشتریِ مردد یک کد تخفیف یک‌بارمصرف و محدود بدهد؛ سقف روزانه و درصد را شما تعیین می‌کنید. در این نمایش کدی صادر نمی‌شود.",
      sources: [{ title: "ماژول دستیار فروش ووکامرس" }],
      follow: ["این دستیار چطور کار می‌کند؟", "با یک کارشناس صحبت کنم"],
    },
    {
      id: "contact",
      keys: ["تماس", "تلفن", "شماره", "آدرس", "ایمیل", "پشتیبانی", "کجا هستید", "شعبه"],
      reply: "تلفن پشتیبانی: ۰۲۱-۱۲۳۴۵۶۷۸ (نمونه). ایمیل: support@avasound.example. آدرس: تهران، خیابان نمونه، پلاک ۱۰ (همهٔ این اطلاعات فرضی است).",
      sources: [{ title: "ساعت کاری و تماس" }],
      follow: ["ساعت کاری فروشگاه چیست؟", "با یک کارشناس صحبت کنم"],
    },
    {
      id: "human",
      keys: ["اپراتور", "انسان", "کارشناس", "آدم", "صحبت کنم", "مشاور"],
      reply:
        "با ماژول «چت زنده»، گفتگو به یک اپراتور واقعی تحویل می‌شود: او کل گفتگو و خلاصهٔ هوشمند آن را می‌بیند، پاسخ‌های آماده دارد و می‌تواند از پنل یا از بله و تلگرام جواب بدهد.",
      sources: [{ title: "ماژول چت زنده" }],
      follow: ["این دستیار چطور کار می‌کند؟", "اطلاعات من کجا ذخیره می‌شود؟"],
    },
    {
      id: "privacy",
      keys: ["اطلاعات", "حریم", "ذخیره", "امنیت", "داده", "کلید"],
      reply:
        "گفتگوها در پایگاه‌دادهٔ وردپرس خودِ شما می‌مانند، نه روی سرور ما. کلید هوش مصنوعی فقط در سرور شما ذخیره می‌شود و هیچ‌وقت به مرورگر بازدیدکننده نمی‌رسد. می‌توانید مدت نگه‌داری را هم محدود کنید.",
      sources: [{ title: "امنیت و حریم خصوصی" }],
      follow: ["این دستیار چطور کار می‌کند؟", "با یک کارشناس صحبت کنم"],
    },
    {
      id: "about",
      keys: ["دستیار", "چطور کار", "نکسا", "nexachat", "هوش مصنوعی", "افزونه", "چیست", "کیستی", "تو کی"],
      reply:
        "من نسخهٔ نمایشی NexaChatAI هستم. افزونه اطلاعات کسب‌وکار شما را (متن، پرسش‌های متداول، PDF، Word و صفحه‌های سایت) یاد می‌گیرد و به مشتری‌ها به فارسی پاسخ می‌دهد و منبع پاسخ را زیرش نشان می‌دهد. اگر چیزی را نداند، می‌گوید نمی‌داند.",
      sources: [{ title: "معرفی NexaChatAI" }],
      follow: ["اطلاعات من کجا ذخیره می‌شود؟", "با یک کارشناس صحبت کنم"],
    },
  ],
};

export const EN: Knowledge = {
  starters: [
    "What are your opening hours?",
    "How long does delivery take?",
    "What is the return policy?",
    "Recommend wireless headphones",
    "What should I buy with a $40 budget?",
    "How long is the warranty?",
    "Do you offer instalments?",
    "How do I track my order?",
    "Do you have a discount code?",
    "Let me talk to a person",
    "How does this assistant work?",
    "Where is my data stored?",
  ],
  greeting: {
    reply: "Hello! 👋 I am the assistant of “Ava Sound”. Ask about headphones, speakers, smartwatches, delivery, warranty or payment.",
    follow: ["Recommend wireless headphones", "How long does delivery take?", "How long is the warranty?"],
  },
  fallback: {
    reply:
      "This conversation is a demo and only answers the prepared questions of the fictional “Ava Sound” store. On a real site the assistant answers from your own knowledge and the AI model you choose. Try one of the suggested questions.",
    follow: ["What are your opening hours?", "What is the return policy?", "How does this assistant work?"],
  },
  entries: [
    {
      id: "hours",
      keys: ["opening hours", "open", "hours", "closed", "thursday", "friday", "what time"],
      reply: "The store and support are available Saturday to Wednesday 9:00–18:00 and Thursday 9:00–14:00; closed on Fridays. Online orders are accepted around the clock.",
      sources: [{ title: "Opening hours and contact" }],
      follow: ["How can I contact the store?", "How long does delivery take?"],
    },
    {
      id: "shipping",
      keys: ["delivery", "shipping", "ship", "how long", "free shipping", "arrive"],
      reply: "Orders inside Tehran arrive in 1–2 working days and other cities in 2–5 working days. Shipping is free above $30 and costs $2 below that.",
      sources: [{ title: "Delivery" }],
      follow: ["Do you have same-day courier?", "How do I track my order?"],
    },
    {
      id: "express",
      keys: ["courier", "same-day", "same day", "express", "today", "urgent", "fast"],
      reply: "In Tehran, orders placed before 14:00 are delivered the same day by courier for $3. We do not offer courier delivery to other cities.",
      sources: [{ title: "Delivery" }],
      follow: ["How long does delivery take?", "What payment methods do you accept?"],
    },
    {
      id: "returns",
      keys: ["return", "refund", "exchange", "send back", "money back"],
      reply: "You can return an item within 7 days of delivery if the packaging and accessories are intact. If the item does not match your order or arrives damaged, we pay the return shipping.",
      sources: [{ title: "Return policy" }],
      follow: ["How long is the warranty?", "What payment methods do you accept?"],
    },
    {
      id: "payment",
      keys: ["payment", "pay", "card", "cash", "on delivery", "gateway"],
      reply: "Payment is by bank gateway. In Tehran you can also pay on delivery with a card reader brought by the courier.",
      sources: [{ title: "Payment methods" }],
      follow: ["Do you offer instalments?", "Do you have a discount code?"],
    },
    {
      id: "installment",
      keys: ["instalment", "installment", "instalments", "installments", "credit", "monthly"],
      reply: "For purchases above $75 we offer a 4-month instalment plan with no down payment. The fee is shown on the payment page before you confirm.",
      sources: [{ title: "Instalments" }],
      follow: ["What payment methods do you accept?", "Tell me about the Pulse smartwatch"],
    },
    {
      id: "tracking",
      keys: ["track", "tracking", "my order", "where is", "order status"],
      reply: "A tracking code is sent by SMS after dispatch. With the plugin's WooCommerce module, customers type their order number and phone here and see the real order status. (This demo has no orders.)",
      sources: [{ title: "Order tracking" }],
      follow: ["How long does delivery take?", "Let me talk to a person"],
    },
    {
      id: "headphone",
      keys: ["headphone", "headphones", "headset", "nova", "wireless", "noise"],
      reply: "“Nova 2” wireless headphones: $62, 30-hour battery, active noise cancelling, Bluetooth 5.3. Available in black and navy. On a tighter budget, look at the “Wave Air” earbuds.",
      sources: [{ title: "Ava Sound catalogue (sample)" }],
      follow: ["Tell me about the Wave Air earbuds", "What should I buy with a $40 budget?"],
    },
    {
      id: "earbuds",
      keys: ["earbuds", "earbud", "wave air", "in-ear", "airpods"],
      reply: "“Wave Air” earbuds: $47, 8 hours of listening (28 with the charging case), IPX5 sweat resistance. White only, and only 4 are left in stock.",
      sources: [{ title: "Ava Sound catalogue (sample)" }],
      follow: ["What should I buy with a $40 budget?", "How long is the warranty?"],
    },
    {
      id: "budget",
      keys: ["budget", "$40", "cheap", "affordable", "what should i buy", "suggest", "recommend something"],
      reply: "At around $40 the best fit is the “Wave Air” earbuds ($47): light and sweat-proof, good for workouts and commuting. If noise cancelling matters more, “Nova 2” at $62 is the next step up. Want me to compare them?",
      sources: [{ title: "Ava Sound catalogue (sample)" }],
      follow: ["Recommend wireless headphones", "Do you offer instalments?"],
    },
    {
      id: "speaker",
      keys: ["speaker", "rhythm", "bluetooth speaker", "portable"],
      reply: "“Rhythm 3” Bluetooth speaker: $32, IPX7 waterproof, 12 hours of playback, and it pairs with a second speaker for stereo sound. In stock.",
      sources: [{ title: "Ava Sound catalogue (sample)" }],
      follow: ["How long is the warranty?", "Do you have same-day courier?"],
    },
    {
      id: "watch",
      keys: ["smartwatch", "pulse", "watch", "heart rate", "fitness"],
      reply: "“Pulse” smartwatch: $97, waterproof, heart-rate and sleep tracking, 7-day battery. Works with Android and iOS. Black only for now.",
      sources: [{ title: "Ava Sound catalogue (sample)" }],
      follow: ["Do you offer instalments?", "How long is the warranty?"],
    },
    {
      id: "warranty",
      keys: ["warranty", "guarantee", "after-sales", "broken", "repair"],
      reply: "Every product carries an 18-month manufacturer warranty. Give support your order code to use it; replacement or repair is handled at our Tehran service centre.",
      sources: [{ title: "Warranty and after-sales" }],
      follow: ["What is the return policy?", "Let me talk to a person"],
    },
    {
      id: "coupon",
      keys: ["discount", "coupon", "promo", "sale", "voucher"],
      reply: "With the WooCommerce module the plugin can hand a hesitant customer a single-use, capped discount code; you set the daily cap and the percentage. No code is issued in this demo.",
      sources: [{ title: "WooCommerce sales assistant module" }],
      follow: ["How does this assistant work?", "Let me talk to a person"],
    },
    {
      id: "contact",
      keys: ["contact", "phone", "address", "email", "support", "where are you", "branch"],
      reply: "Support phone: +98 21 1234 5678 (sample). Email: support@avasound.example. Address: Sample Street 10, Tehran (all of this is fictional).",
      sources: [{ title: "Opening hours and contact" }],
      follow: ["What are your opening hours?", "Let me talk to a person"],
    },
    {
      id: "human",
      keys: ["human", "person", "agent", "operator", "advisor", "talk to"],
      reply: "With the “Live chat” module the conversation is handed to a real operator: they see the whole chat and its smart summary, have canned replies, and can answer from the panel or from Bale and Telegram.",
      sources: [{ title: "Live chat module" }],
      follow: ["How does this assistant work?", "Where is my data stored?"],
    },
    {
      id: "privacy",
      keys: ["data", "privacy", "stored", "store", "security", "secure", "key"],
      reply: "Conversations stay in your own WordPress database, not on our servers. The AI key is stored only on your server and never reaches the visitor's browser. You can also limit how long chats are kept.",
      sources: [{ title: "Security and privacy" }],
      follow: ["How does this assistant work?", "Let me talk to a person"],
    },
    {
      id: "about",
      keys: ["assistant", "how does", "nexachat", "ai", "plugin", "what is", "who are you", "work"],
      reply: "I am the demo of NexaChatAI. The plugin learns your business information (text, FAQs, PDF, Word and site pages) and answers customers in their language, showing the source under each answer. If it does not know, it says so.",
      sources: [{ title: "About NexaChatAI" }],
      follow: ["Where is my data stored?", "Let me talk to a person"],
    },
  ],
};
