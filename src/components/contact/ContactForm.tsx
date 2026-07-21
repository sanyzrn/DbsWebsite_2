import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type RefObject,
  type SetStateAction,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Mail,
  Send,
} from "lucide-react";
import { useApp } from "../../lib/app";
import { PROJECT_TYPE_IDS, type ProjectTypeId } from "../../lib/i18n";
import {
  buildMailto,
  emptyContactFields,
  type ContactFields,
  type ContactStatus,
} from "../../lib/mailto";
import { cn } from "../../utils/cn";

const SUBMIT_MIN_MS = 2000;
const FETCH_TIMEOUT_MS = 15_000;

export function ContactUnavailable({
  emailLinkRef,
}: {
  emailLinkRef?: RefObject<HTMLAnchorElement | null>;
}) {
  const { t } = useApp();
  return (
    <div className="rounded-sm border border-line bg-page px-4 py-5 md:px-5 md:py-6">
      <p className="text-[14.5px] font-medium leading-7 text-ink2 md:text-[15px] md:leading-8">
        {t.contact.form.formUnavailable}
      </p>
      <a
        ref={emailLinkRef}
        href={`mailto:${t.contact.email}`}
        dir="ltr"
        className="mt-4 inline-flex text-[15px] font-bold tracking-tight text-hi transition-colors hover:text-ink"
      >
        {t.contact.email}
      </a>
    </div>
  );
}

type ContactFormProps = {
  idPrefix: string;
  firstFieldRef?: RefObject<HTMLInputElement | null>;
  status: ContactStatus;
  setStatus: Dispatch<SetStateAction<ContactStatus>>;
  truncated: boolean;
  setTruncated: Dispatch<SetStateAction<boolean>>;
};

export function ContactForm({
  idPrefix,
  firstFieldRef,
  status,
  setStatus,
  truncated,
  setTruncated,
}: ContactFormProps) {
  const { t } = useApp();
  const f = t.contact.form;
  const [fields, setFields] = useState<ContactFields>({ ...emptyContactFields });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFields, boolean>>>({});
  const [website, setWebsite] = useState("");
  const mountedAt = useRef(0);
  const emailFieldRef = useRef<HTMLInputElement>(null);
  const messageFieldRef = useRef<HTMLTextAreaElement>(null);
  const statusAlertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status !== "error" && status !== "timeout") return;
    const id = window.setTimeout(() => statusAlertRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [status]);

  const typeLabel = f.types[fields.type];

  const set = (key: keyof ContactFields, value: string) => {
    setFields((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: false }));
  };

  const focusFirstInvalid = (next: Partial<Record<keyof ContactFields, boolean>>) => {
    window.setTimeout(() => {
      if (next.name) {
        (firstFieldRef?.current ?? document.getElementById(`${idPrefix}-name`))?.focus();
      } else if (next.email) {
        emailFieldRef.current?.focus();
      } else if (next.message) {
        messageFieldRef.current?.focus();
      }
    }, 0);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof ContactFields, boolean>> = {
      name: !fields.name.trim(),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email),
      message: !fields.message.trim(),
    };
    setErrors(next);
    if (next.name || next.email || next.message) {
      focusFirstInvalid(next);
      return;
    }

    // Honeypot: bots that fill hidden fields get a fake success — no network call.
    if (website.trim()) {
      setStatus("delivered");
      return;
    }

    // Timing check: reject submissions faster than a human can reasonably fill the form.
    if (Date.now() - mountedAt.current < SUBMIT_MIN_MS) {
      setStatus("error");
      return;
    }

    const formspreeId = import.meta.env.VITE_FORMSPREE_ID as string | undefined;

    if (formspreeId) {
      setStatus("sending");
      const controller = new AbortController();
      let timedOut = false;
      const timer = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, FETCH_TIMEOUT_MS);

      try {
        const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            name: fields.name,
            email: fields.email,
            company: fields.company,
            type: fields.type,
            message: fields.message,
            budget: fields.budget,
            timeline: fields.timeline,
            _subject: `Project inquiry — ${typeLabel} — ${fields.name}`,
          }),
        });
        if (!res.ok) throw new Error("formspree failed");
        setStatus("delivered");
        setTruncated(false);
        setFields({ ...emptyContactFields });
      } catch (err) {
        const aborted = err instanceof DOMException && err.name === "AbortError";
        setStatus(timedOut || aborted ? "timeout" : "error");
      } finally {
        window.clearTimeout(timer);
      }
      return;
    }

    const mailto = buildMailto(fields, typeLabel);
    setTruncated(mailto.truncated);
    window.location.href = mailto.href;
    // Honest fallback: do not clear fields — the message has not been delivered yet.
    setStatus("mailed");
  };

  const hpId = `${idPrefix}-website`;
  const nameErrId = `${idPrefix}-name-err`;
  const emailErrId = `${idPrefix}-email-err`;
  const messageErrId = `${idPrefix}-message-err`;
  const statusRegionId = `${idPrefix}-status`;

  return (
    <form onSubmit={submit} noValidate>
      {/* Honeypot — visually hidden; leave empty */}
      <div
        className="absolute -left-[10000px] top-auto h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      >
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
          <label htmlFor={`${idPrefix}-name`} className="mb-2 block text-[12.5px] font-bold text-ink2">
            {f.name} <span className="text-hi">*</span>
          </label>
          <input
            ref={firstFieldRef}
            id={`${idPrefix}-name`}
            className={cn("field", errors.name && "border-[#C2603E]!")}
            placeholder={f.namePh}
            value={fields.name}
            onChange={(e) => set("name", e.target.value)}
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? nameErrId : undefined}
          />
          {errors.name && (
            <p id={nameErrId} className="mt-1.5 text-[11.5px] font-semibold text-[#C2603E]">
              {f.required}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-email`} className="mb-2 block text-[12.5px] font-bold text-ink2">
            {f.email} <span className="text-hi">*</span>
          </label>
          <input
            ref={emailFieldRef}
            id={`${idPrefix}-email`}
            type="email"
            dir="ltr"
            className={cn("field text-start", errors.email && "border-[#C2603E]!")}
            placeholder={f.emailPh}
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? emailErrId : undefined}
          />
          {errors.email && (
            <p id={emailErrId} className="mt-1.5 text-[11.5px] font-semibold text-[#C2603E]">
              {f.required}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-company`} className="mb-2 block text-[12.5px] font-bold text-ink2">
            {f.company}
          </label>
          <input
            id={`${idPrefix}-company`}
            className="field"
            placeholder={f.companyPh}
            value={fields.company}
            onChange={(e) => set("company", e.target.value)}
            autoComplete="organization"
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-type`} className="mb-2 block text-[12.5px] font-bold text-ink2">
            {f.type}
          </label>
          <div className="relative">
            <select
              id={`${idPrefix}-type`}
              className="field"
              value={fields.type}
              onChange={(e) => set("type", e.target.value as ProjectTypeId)}
            >
              {PROJECT_TYPE_IDS.map((id) => (
                <option key={id} value={id}>
                  {f.types[id]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink3" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${idPrefix}-message`} className="mb-2 block text-[12.5px] font-bold text-ink2">
            {f.message} <span className="text-hi">*</span>
          </label>
          <textarea
            ref={messageFieldRef}
            id={`${idPrefix}-message`}
            className={cn("field min-h-[120px]", errors.message && "border-[#C2603E]!")}
            placeholder={f.messagePh}
            value={fields.message}
            onChange={(e) => set("message", e.target.value)}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? messageErrId : undefined}
          />
          {errors.message && (
            <p id={messageErrId} className="mt-1.5 text-[11.5px] font-semibold text-[#C2603E]">
              {f.required}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-budget`} className="mb-2 block text-[12.5px] font-bold text-ink2">
            {f.budget}
          </label>
          <input
            id={`${idPrefix}-budget`}
            className="field"
            placeholder={f.budgetPh}
            value={fields.budget}
            onChange={(e) => set("budget", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-timeline`} className="mb-2 block text-[12.5px] font-bold text-ink2">
            {f.timeline}
          </label>
          <input
            id={`${idPrefix}-timeline`}
            className="field"
            placeholder={f.timelinePh}
            value={fields.timeline}
            onChange={(e) => set("timeline", e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary mt-7 w-full" disabled={status === "sending"}>
        {status === "sending" ? f.sending : f.submit}
        <Send className="h-4 w-4 rtl:-scale-x-100" strokeWidth={2.2} />
      </button>

      <p className="mt-4 text-center text-[12px] text-ink3">
        {f.directEmail}{" "}
        <a href={`mailto:${t.contact.email}`} dir="ltr" className="font-bold text-hi hover:underline">
          {t.contact.email}
        </a>
      </p>

      {status === "sending" && (
        <div id={statusRegionId} role="status" aria-live="polite" className="sr-only">
          {f.sending}
        </div>
      )}

      {status === "delivered" && (
        <div
          id={statusRegionId}
          role="status"
          aria-live="polite"
          className="mt-5 flex items-start gap-3 rounded-sm border border-sage/40 bg-sage/10 px-4 py-3.5"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
          <div>
            <p className="text-[13.5px] font-bold text-ink">{f.deliveredTitle}</p>
            <p className="mt-1 text-[12.5px] leading-6 text-ink2">{f.deliveredBody}</p>
          </div>
        </div>
      )}

      {status === "mailed" && (
        <div
          id={statusRegionId}
          role="status"
          aria-live="polite"
          className="mt-5 flex items-start gap-3 rounded-sm border border-line bg-surface px-4 py-3.5"
        >
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-hi" />
          <div>
            <p className="text-[13.5px] font-bold text-ink">{f.mailedTitle}</p>
            <p className="mt-1 text-[12.5px] leading-6 text-ink2">{f.mailedBody}</p>
            {truncated && (
              <p className="mt-2 text-[12.5px] font-semibold leading-6 text-ink2">{f.mailedTruncated}</p>
            )}
          </div>
        </div>
      )}

      {status === "timeout" && (
        <div
          ref={statusAlertRef}
          id={statusRegionId}
          role="alert"
          tabIndex={-1}
          className="mt-5 flex items-start gap-3 rounded-sm border border-[#C2603E]/40 bg-[#C2603E]/10 px-4 py-3.5 outline-none"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#C2603E]" />
          <div>
            <p className="text-[13.5px] font-bold text-ink">{f.timeoutTitle}</p>
            <p className="mt-1 text-[12.5px] leading-6 text-ink2">{f.timeoutBody}</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div
          ref={statusAlertRef}
          id={statusRegionId}
          role="alert"
          tabIndex={-1}
          className="mt-5 flex items-start gap-3 rounded-sm border border-[#C2603E]/40 bg-[#C2603E]/10 px-4 py-3.5 outline-none"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#C2603E]" />
          <div>
            <p className="text-[13.5px] font-bold text-ink">{f.errorTitle}</p>
            <p className="mt-1 text-[12.5px] leading-6 text-ink2">{f.errorBody}</p>
          </div>
        </div>
      )}
    </form>
  );
}
