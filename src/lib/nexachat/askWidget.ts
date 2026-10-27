/** Type a question into the widget's own composer and send it, exactly as a visitor would. */
export function askWidget(host: HTMLElement | null, text: string): boolean {
  const input = host?.querySelector<HTMLTextAreaElement | HTMLInputElement>(".ssc-input");
  const send = host?.querySelector<HTMLButtonElement>(".ssc-send");
  if (!input || !send) return false;
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(input, text);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  send.click();
  return true;
}
