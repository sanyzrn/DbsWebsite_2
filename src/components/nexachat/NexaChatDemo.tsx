import { useEffect, useRef, useState } from "react";
import { askWidget } from "../../lib/nexachat/askWidget";
import { buildDemoConfig, DEMO_KNOWLEDGE, installDemoBackend, type DemoLang } from "../../lib/nexachat/demo";

const WIDGET_JS = "/nexachat-demo/chatbot.js";
const WIDGET_CSS = "/nexachat-demo/chatbot.css";

declare global {
  interface Window {
    SSCChatbot?: { mountPreview: (node: HTMLElement) => void };
    SSCChatbotConfig?: Record<string, unknown>;
  }
}

function ensureStylesheet() {
  if (document.querySelector(`link[href="${WIDGET_CSS}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = WIDGET_CSS;
  document.head.appendChild(link);
}

type Props = {
  lang: DemoLang;
  /** Label above the sample questions. */
  tryLabel: string;
  /** Shown while the widget loads, and if it cannot load. */
  loadingLabel: string;
  failedLabel: string;
  /** Answer delay in ms (tests use 0). */
  delayMs?: number;
};

/**
 * The plugin's real widget, mounted inline, answered by a scripted back end.
 * Loading the script again per mount gives each language its own widget instance.
 */
export function NexaChatDemo({ lang, tryLabel, loadingLabel, failedLabel, delayMs }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    setState("loading");
    ensureStylesheet();
    const restoreFetch = installDemoBackend(lang, delayMs);
    delete window.SSCChatbot;
    window.SSCChatbotConfig = buildDemoConfig(lang);
    const script = document.createElement("script");
    script.src = WIDGET_JS;
    script.async = true;
    script.onload = () => {
      if (cancelled || !window.SSCChatbot) return;
      window.SSCChatbot.mountPreview(host);
      setState("ready");
    };
    script.onerror = () => {
      if (!cancelled) setState("failed");
    };
    document.body.appendChild(script);
    return () => {
      cancelled = true;
      restoreFetch();
      script.remove();
      host.replaceChildren();
      delete window.SSCChatbot;
    };
  }, [lang, delayMs]);

  const starters = DEMO_KNOWLEDGE[lang].starters;

  return (
    <div className="nexachat-demo">
      <div ref={hostRef} className="nexachat-demo__host" dir={lang === "fa" ? "rtl" : "ltr"} />
      {state === "loading" && (
        <p role="status" className="nexachat-demo__note">
          {loadingLabel}
        </p>
      )}
      {state === "failed" && (
        <p role="alert" className="nexachat-demo__note">
          {failedLabel}
        </p>
      )}
      <div className="nexachat-demo__starters">
        <p className="nexachat-demo__try">{tryLabel}</p>
        <ul>
          {starters.map((question) => (
            <li key={question}>
              <button type="button" className="chip" disabled={state !== "ready"} onClick={() => askWidget(hostRef.current, question)}>
                {question}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
