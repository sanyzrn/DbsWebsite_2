/** Drive the plugin's real launcher and composer from page buttons, the way a visitor would. */

const OPEN_CLASS = "is-open";

/** Open the chat window if it is closed. Returns false when the widget is not on the page yet. */
export function openNexaChat(): boolean {
  const root = document.getElementById("ssc-chatbot-root");
  const launcher = root?.querySelector<HTMLButtonElement>(".ssc-launcher");
  if (!root || !launcher) return false;
  if (!root.classList.contains(OPEN_CLASS)) launcher.click();
  return true;
}

/** Type a question into the widget's composer and send it. Opens the window first. */
export function askNexaChat(text: string): boolean {
  if (!openNexaChat()) return false;
  const root = document.getElementById("ssc-chatbot-root");
  const input = root?.querySelector<HTMLTextAreaElement>(".ssc-input");
  const send = root?.querySelector<HTMLButtonElement>(".ssc-send");
  if (!input || !send) return false;
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set?.call(input, text);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  send.click();
  return true;
}
