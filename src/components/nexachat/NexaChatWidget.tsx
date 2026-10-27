import { useEffect } from "react";
import { buildDemoConfig, installDemoBackend, type DemoLang } from "../../lib/nexachat/demo";

const WIDGET_JS = "/nexachat-demo/chatbot.js";
const WIDGET_CSS = "/nexachat-demo/chatbot.css";
const ROOT_ID = "ssc-chatbot-root";

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
  /** Answer delay in ms (tests use 0). */
  delayMs?: number;
};

/**
 * The plugin's real widget on this page: the same launcher in the corner of the screen and the
 * same chat window, in the dark theme, answered by a scripted back end instead of WordPress.
 * Removing the component removes the widget and restores window.fetch.
 */
export function NexaChatWidget({ lang, delayMs }: Props) {
  useEffect(() => {
    ensureStylesheet();
    const restoreFetch = installDemoBackend(lang, delayMs);
    window.SSCChatbotConfig = buildDemoConfig(lang);
    const script = document.createElement("script");
    script.src = WIDGET_JS;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      restoreFetch();
      script.remove();
      document.getElementById(ROOT_ID)?.replaceChildren();
      delete window.SSCChatbot;
      delete window.SSCChatbotConfig;
    };
  }, [lang, delayMs]);

  return <div id={ROOT_ID} className="ssc-root" dir={lang === "fa" ? "rtl" : "ltr"} />;
}
