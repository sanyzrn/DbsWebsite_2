import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, ChevronDown, Send, ShieldAlert } from "lucide-react";
import { useApp } from "../../lib/app";
import { ISSUE_KIND_IDS, ISSUE_PRODUCT_IDS, type IssueKindId, type IssueProductId } from "../../lib/i18n";
import {
  emptyIssueFields,
  ISSUE_FIELD_MAX,
  issuePrefillFromQuery,
  type IssueFields,
} from "../../lib/issues";
import type { ContactStatus } from "../../lib/mailto";
import { cn } from "../../utils/cn";

const SUBMIT_MIN_MS = 2000;
const FETCH_TIMEOUT_MS = 15_000;
const ISSUE_API = "/api/issue.php";

type Errors = Partial<Record<"name" | "email" | "message", boolean>>;

export function IssueForm({ idPrefix = "issue" }: { idPrefix?: string }) {
  const { t } = useApp();
  const f = t.issues.form;
  const [searchParams] = useSearchParams();
  const [fields, setFields] = useState<IssueFields>({ ...emptyIssueFields });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [website, setWebsite] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const mountedAt = useRef(0);
  const prefilled = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
    return () => requestRef.current?.abort();
  }, []);

  // A link from a product (…/issues?product=nexachatai&version=1.7.8) opens the form filled in.
  useEffect(() => {
    if (prefilled.current) return;
    const prefill = issuePrefillFromQuery(searchParams);
    if (Object.keys(prefill).length === 0) return;
    prefilled.current = true;
    setFields((s) => ({ ...s, ...prefill }));
    if (prefill.version) setDetailsOpen(true);
  }, [searchParams]);

  useEffect(() => {
    if (status !== "error" && status !== "timeout" && status !== "rateLimited") return;
    const id = window.setTimeout(() => alertRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [status]);

  const set = <K extends keyof IssueFields>(key: K, value: IssueFields[K]) => {
    setFields((s) => ({ ...s, [key]: value }));
    if (key === "name" || key === "email" || key === "message") setErrors((e) => ({ ...e, [key]: false }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (requestRef.current) return;
    const next: Errors = {
      name: !fields.name.trim() || fields.name.trim().length > ISSUE_FIELD_MAX.name,
      email:
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()) ||
        fields.email.trim().length > ISSUE_FIELD_MAX.email,
      message: !fields.message.trim() || fields.message.trim().length > ISSUE_FIELD_MAX.message,
    };
    setErrors(next);
    if (next.name || next.email || next.message) {
      window.setTimeout(() => {
        (next.name ? nameRef.current : next.email ? emailRef.current : messageRef.current)?.focus();
      }, 0);
      return;
    }
    if (
      fields.version.trim().length > ISSUE_FIELD_MAX.version ||
      fields.environment.trim().length > ISSUE_FIELD_MAX.environment
    ) {
      setStatus("error");
      return;
    }

    // Honeypot: bots that fill hidden fields get a fake success — no network call.
    if (website.trim()) {
      setStatus("delivered");
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    setStatus("sending");

    // Wait out the remainder of SUBMIT_MIN_MS rather than showing an error to a fast human.
    const elapsedMs = Date.now() - mountedAt.current;
    if (elapsedMs < SUBMIT_MIN_MS) {
      await new Promise<void>((resolve) => {
        const finish = () => {
          window.clearTimeout(waitTimer);
          controller.signal.removeEventListener("abort", finish);
          resolve();
        };
        const waitTimer = window.setTimeout(finish, SUBMIT_MIN_MS - elapsedMs);
        controller.signal.addEventListener("abort", finish, { once: true });
      });
    }
    if (controller.signal.aborted) return;
    const submitElapsedMs = Math.max(SUBMIT_MIN_MS, Date.now() - mountedAt.current);

    let timedOut = false;
    const timer = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(ISSUE_API, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          product: fields.product,
          kind: fields.kind,
          version: fields.version.trim(),
          environment: fields.environment.trim(),
          message: fields.message.trim(),
          website,
          elapsedMs: submitElapsedMs,
        }),
      });
      let payload: { ok?: boolean; error?: string } = {};
      try {
        payload = (await res.json()) as { ok?: boolean; error?: string };
      } catch {
        payload = {};
      }
      if (controller.signal.aborted && !timedOut) return;
      if (res.status === 429 || payload.error === "rate_limited") {
        setStatus("rateLimited");
        return;
      }
      if (!res.ok || !payload?.ok) throw new Error(`issue api failed (${res.status})`);
      setStatus("delivered");
      setFields((s) => ({ ...emptyIssueFields, product: s.product }));
      setWebsite("");
    } catch (err) {
      if (controller.signal.aborted && !timedOut) return;
      const aborted = err instanceof DOMException && err.name === "AbortError";
      setStatus(timedOut || aborted ? "timeout" : "error");
    } finally {
      window.clearTimeout(timer);
      requestRef.current = null;
    }
  };

  const hpId = `${idPrefix}-website`;
  const tooLong = (value: string, max: number) =>
    value.trim().length > max ? f.fieldTooLong.replace("{n}", String(max)) : f.required;

  const alertBox = (title: string, body: string) => (
    <div
      ref={alertRef}
      id={`${idPrefix}-status`}
      role="alert"
      tabIndex={-1}
      className="mt-5 flex items-start gap-3 rounded-[4px] border border-error/40 bg-error/10 px-4 py-3.5 outline-none"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
      <div>
        <p className="text-[15px] font-bold text-ink">{title}</p>
        <p className="mt-1 text-[14px] leading-6 text-ink2">{body}</p>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      {/* Honeypot — visually hidden; leave empty */}
      <div className="absolute -left-[10000px] top-auto h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
        <label htmlFor={hpId}>Website</label>
        <input
          id={hpId}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-product`} className="mb-2 block text-[14px] font-semibold text-ink">
            {f.product} <span className="text-hi">*</span>
          </label>
          <div className="relative">
            <select
              id={`${idPrefix}-product`}
              className="field"
              value={fields.product}
              onChange={(e) => set("product", e.target.value as IssueProductId)}
            >
              {ISSUE_PRODUCT_IDS.map((id) => (
                <option key={id} value={id}>
                  {f.products[id]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink3" />
          </div>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-kind`} className="mb-2 block text-[14px] font-semibold text-ink">
            {f.kind} <span className="text-hi">*</span>
          </label>
          <div className="relative">
            <select
              id={`${idPrefix}-kind`}
              className="field"
              value={fields.kind}
              onChange={(e) => set("kind", e.target.value as IssueKindId)}
              aria-describedby={fields.kind === "security" ? `${idPrefix}-security` : undefined}
            >
              {ISSUE_KIND_IDS.map((id) => (
                <option key={id} value={id}>
                  {f.kinds[id]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink3" />
          </div>
        </div>

        {fields.kind === "security" && (
          <p
            id={`${idPrefix}-security`}
            className="flex items-start gap-2 text-[13px] leading-5 text-ink2 sm:col-span-2"
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-hi" />
            {f.securityNote}
          </p>
        )}

        <div>
          <label htmlFor={`${idPrefix}-name`} className="mb-2 block text-[14px] font-semibold text-ink">
            {f.name} <span className="text-hi">*</span>
          </label>
          <input
            ref={nameRef}
            id={`${idPrefix}-name`}
            className={cn("field", errors.name && "border-error!")}
            placeholder={f.namePh}
            value={fields.name}
            onChange={(e) => set("name", e.target.value)}
            autoComplete="name"
            required
            maxLength={ISSUE_FIELD_MAX.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${idPrefix}-name-err` : undefined}
          />
          {errors.name && (
            <p id={`${idPrefix}-name-err`} className="mt-1.5 text-[13px] font-semibold text-error">
              {tooLong(fields.name, ISSUE_FIELD_MAX.name)}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-email`} className="mb-2 block text-[14px] font-semibold text-ink">
            {f.email} <span className="text-hi">*</span>
          </label>
          <input
            ref={emailRef}
            id={`${idPrefix}-email`}
            type="email"
            dir="ltr"
            className={cn("field text-start", errors.email && "border-error!")}
            placeholder={f.emailPh}
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
            required
            maxLength={ISSUE_FIELD_MAX.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${idPrefix}-email-err` : undefined}
          />
          {errors.email && (
            <p id={`${idPrefix}-email-err`} className="mt-1.5 text-[13px] font-semibold text-error">
              {fields.email.trim().length > ISSUE_FIELD_MAX.email
                ? tooLong(fields.email, ISSUE_FIELD_MAX.email)
                : fields.email.trim()
                  ? f.invalidEmail
                  : f.required}
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${idPrefix}-message`} className="mb-2 block text-[14px] font-semibold text-ink">
            {f.message} <span className="text-hi">*</span>
          </label>
          <textarea
            ref={messageRef}
            id={`${idPrefix}-message`}
            className={cn("field min-h-[140px]", errors.message && "border-error!")}
            placeholder={f.messagePh}
            value={fields.message}
            onChange={(e) => set("message", e.target.value)}
            maxLength={ISSUE_FIELD_MAX.message}
            required
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? `${idPrefix}-message-err` : undefined}
          />
          {errors.message && (
            <p id={`${idPrefix}-message-err`} className="mt-1.5 text-[13px] font-semibold text-error">
              {tooLong(fields.message, ISSUE_FIELD_MAX.message)}
            </p>
          )}
        </div>
      </div>

      <details
        className="group mt-5 border-t border-line pt-5"
        open={detailsOpen}
        onToggle={(e) => setDetailsOpen((e.currentTarget as HTMLDetailsElement).open)}
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 text-[14px] font-bold text-ink2 transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
          <ChevronDown className="h-4 w-4 shrink-0 text-ink3 transition-transform group-open:rotate-180" />
          {f.optionalDetails}
        </summary>
        <p className="mt-2 text-[13px] leading-5 text-ink3">{f.optionalDetailsHint}</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${idPrefix}-version`} className="mb-2 block text-[14px] font-semibold text-ink">
              {f.version}
            </label>
            <input
              id={`${idPrefix}-version`}
              dir="ltr"
              className="field text-start"
              placeholder={f.versionPh}
              value={fields.version}
              onChange={(e) => set("version", e.target.value)}
              maxLength={ISSUE_FIELD_MAX.version}
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-environment`} className="mb-2 block text-[14px] font-semibold text-ink">
              {f.environment}
            </label>
            <input
              id={`${idPrefix}-environment`}
              className="field"
              placeholder={f.environmentPh}
              value={fields.environment}
              onChange={(e) => set("environment", e.target.value)}
              maxLength={ISSUE_FIELD_MAX.environment}
            />
          </div>
        </div>
      </details>

      <button type="submit" className="btn btn-primary mt-7 w-full" disabled={status === "sending"}>
        {status === "sending" ? f.sending : f.submit}
        <Send className="h-4 w-4 rtl:-scale-x-100" strokeWidth={2.2} />
      </button>

      <p className="mt-4 text-center text-[13px] text-ink3">
        {f.directEmail}{" "}
        <a href={`mailto:${t.contact.email}`} dir="ltr" className="font-bold text-hi hover:underline">
          {t.contact.email}
        </a>
      </p>

      {status === "sending" && (
        <div id={`${idPrefix}-status`} role="status" aria-live="polite" className="sr-only">
          {f.sending}
        </div>
      )}

      {status === "delivered" && (
        <div
          id={`${idPrefix}-status`}
          role="status"
          aria-live="polite"
          className="mt-5 flex items-start gap-3 rounded-[4px] border border-sage/40 bg-sage/10 px-4 py-3.5"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
          <div>
            <p className="text-[15px] font-bold text-ink">{f.deliveredTitle}</p>
            <p className="mt-1 text-[14px] leading-6 text-ink2">{f.deliveredBody}</p>
          </div>
        </div>
      )}

      {status === "timeout" && alertBox(f.timeoutTitle, f.timeoutBody)}
      {status === "rateLimited" && alertBox(f.rateLimitedTitle, f.rateLimitedBody.replace("{email}", t.contact.email))}
      {status === "error" && alertBox(f.errorTitle, f.errorBody)}
    </form>
  );
}
