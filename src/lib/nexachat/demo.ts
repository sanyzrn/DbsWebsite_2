/**
 * Scripted back end for the live NexaChatAI demo on /nexachatai.
 *
 * The page runs the plugin's own widget (public/nexachat-demo/chatbot.js) with the plugin's own
 * configuration (widget-config.json, the output of the plugin's build_config() for a demo shop).
 * Only the server is replaced: requests to DEMO_REST are answered here from a small written
 * knowledge, so nothing is sent anywhere and no AI provider is involved.
 *
 * The widget talks to its REST base with POST requests (chat, suggest, feedback). Answers are
 * matched by keywords after the same Persian/Arabic normalisation the plugin applies to questions.
 */
import { EN, FA, type Entry, type Knowledge, type Source } from "./knowledge";
import widgetConfig from "./widget-config.json";

export type DemoLang = "fa" | "en";

export const DEMO_REST = "/__nexachat-demo/";

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
      const k = normalize(key);
      // Very short keys ("ai") must be whole words, or "email" would match them.
      const hit = k.length <= 3 && /^[a-z]+$/.test(k) ? ` ${q} `.includes(` ${k} `) : q.includes(k);
      if (hit) score += k.length > 4 ? 2 : 1;
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
    preview: false,
    themeMode: "dark",
    primaryColor: "#b61615",
    assistantName: lang === "fa" ? "نکسا" : "Nexa",
    orgName: lang === "fa" ? "آواساند" : "Ava Sound",
    welcomeText:
      lang === "fa"
        ? "من دستیار هوشمند «آواساند» هستم؛ یک فروشگاه فرضی برای این دمو. دربارهٔ محصول‌ها، ارسال، گارانتی و پرداخت بپرسید."
        : "I am the assistant of “Ava Sound”, a fictional store for this demo. Ask about products, delivery, warranty and payment.",
    disclaimer:
      lang === "fa"
        ? "این یک گفتگوی نمایشی با پاسخ‌های از پیش نوشته‌شده است."
        : "This is a scripted demo conversation.",
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
