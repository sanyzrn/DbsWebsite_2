/** Shared contact form types + mailto builder (pure, unit-testable). */

import { DEFAULT_PROJECT_TYPE, type ProjectTypeId } from "./i18n";

export type ContactFields = {
  name: string;
  email: string;
  company: string;
  type: ProjectTypeId;
  message: string;
  budget: string;
  timeline: string;
};

export type ContactStatus = "idle" | "sending" | "delivered" | "mailed" | "error" | "timeout";

export const emptyContactFields: ContactFields = {
  name: "",
  email: "",
  company: "",
  type: DEFAULT_PROJECT_TYPE,
  message: "",
  budget: "",
  timeline: "",
};

/** Soft ceiling for encoded mailto: bodies (browser URL length limits). */
export const MAILTO_SAFE = 1800;

/**
 * Build a mailto: href for the contact fallback path.
 * Truncates the message body when the encoded length exceeds MAILTO_SAFE.
 */
export function buildMailto(
  fields: ContactFields,
  typeLabel: string,
  to = "zrn_sany@yahoo.com"
): { href: string; truncated: boolean } {
  const subject = encodeURIComponent(`Project inquiry — ${typeLabel} — ${fields.name}`);
  const header = [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    fields.company.trim() ? `Company: ${fields.company}` : "",
    `Project type: ${typeLabel} (${fields.type})`,
    fields.budget.trim() ? `Budget: ${fields.budget}` : "",
    fields.timeline.trim() ? `Timeline: ${fields.timeline}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const original = fields.message.trim();
  let message = original;
  let body = `${header}\n\n${message}`;
  let truncated = false;
  while (encodeURIComponent(body).length > MAILTO_SAFE && message.length > 40) {
    truncated = true;
    message = `${message.slice(0, Math.floor(message.length * 0.85))}…`;
    body = `${header}\n\n${message}`;
  }
  return {
    href: `mailto:${to}?subject=${subject}&body=${encodeURIComponent(body)}`,
    truncated,
  };
}
