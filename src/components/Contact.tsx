import {
  useEffect,
  useId,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type RefObject,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
  X,
} from "lucide-react";
import { useApp } from "../lib/app";
import {
  DEFAULT_PROJECT_TYPE,
  PROJECT_TYPE_IDS,
  type ProjectTypeId,
} from "../lib/i18n";
import { useBodyScrollLock } from "../lib/useBodyScrollLock";
import { useFocusTrap } from "../lib/useFocusTrap";
import { cn } from "../utils/cn";
import { DirArrow, Reveal } from "./ui";

type Fields = {
  name: string;
  email: string;
  company: string;
  type: ProjectTypeId;
  message: string;
  budget: string;
  timeline: string;
};

type Status = "idle" | "sending" | "delivered" | "mailed" | "error" | "timeout";

const empty: Fields = {
  name: "",
  email: "",
  company: "",
  type: DEFAULT_PROJECT_TYPE,
  message: "",
  budget: "",
  timeline: "",
};

const MAILTO_SAFE = 1800;
const START_HASH = "#contact/start";
const SUBMIT_MIN_MS = 2000;
const FETCH_TIMEOUT_MS = 15_000;

function buildMailto(fields: Fields, typeLabel: string): { href: string; truncated: boolean } {
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
    href: `mailto:zrn_sany@yahoo.com?subject=${subject}&body=${encodeURIComponent(body)}`,
    truncated,
  };
}

function ContactInfoStrip() {
  const { t } = useApp();
  const info = [
    { icon: Mail, label: t.contact.emailLabel, value: t.contact.email, href: `mailto:${t.contact.email}`, ltr: true },
    { icon: Phone, label: t.contact.phoneLabel, value: t.contact.phone, href: `tel:${t.contact.phone}`, ltr: true },
    { icon: MapPin, label: t.contact.locationLabel, value: t.contact.location },
    { icon: Clock3, label: t.contact.responseLabel, value: t.contact.response },
  ];

  return (
    <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-6 sm:mt-10 sm:gap-x-6 sm:gap-y-5 sm:pt-8 lg:grid-cols-4 lg:gap-8 lg:pt-10">
      {info.map((item) => (
        <div key={item.label} className="flex min-w-0 items-start gap-2.5 sm:gap-3.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-line text-hi sm:h-9 sm:w-9">
            <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-ink3 sm:text-[11px]">{item.label}</div>
            <div className="mt-0.5 truncate text-[12.5px] font-bold sm:mt-1 sm:text-[13.5px]" dir={item.ltr ? "ltr" : undefined}>
              {item.href ? (
                <a href={item.href} className="transition-colors hover:text-hi">
                  {item.value}
                </a>
              ) : (
                item.value
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

type ContactFormProps = {
  idPrefix: string;
  firstFieldRef?: RefObject<HTMLInputElement | null>;
  status: Status;
  setStatus: Dispatch<SetStateAction<Status>>;
  truncated: boolean;
  setTruncated: Dispatch<SetStateAction<boolean>>;
};

function ContactForm({
  idPrefix,
  firstFieldRef,
  status,
  setStatus,
  truncated,
  setTruncated,
}: ContactFormProps) {
  const { t } = useApp();
  const f = t.contact.form;
  const [fields, setFields] = useState<Fields>({ ...empty });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [website, setWebsite] = useState("");
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const typeLabel = f.types[fields.type];

  const set = (key: keyof Fields, value: string) => {
    setFields((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: false }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof Fields, boolean>> = {
      name: !fields.name.trim(),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email),
      message: !fields.message.trim(),
    };
    setErrors(next);
    if (next.name || next.email || next.message) return;

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
        setFields({ ...empty });
      } catch {
        setStatus(timedOut ? "timeout" : "error");
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

  return (
    <form onSubmit={submit} noValidate>
      {/* Honeypot — visually hidden; leave empty */}
      <div
        className="absolute h-0 w-0 overflow-hidden opacity-0"
        style={{ left: "-10000px", top: "auto" }}
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
          />
          {errors.name && <p className="mt-1.5 text-[11.5px] font-semibold text-[#C2603E]">{f.required}</p>}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-email`} className="mb-2 block text-[12.5px] font-bold text-ink2">
            {f.email} <span className="text-hi">*</span>
          </label>
          <input
            id={`${idPrefix}-email`}
            type="email"
            dir="ltr"
            className={cn("field text-start", errors.email && "border-[#C2603E]!")}
            placeholder={f.emailPh}
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
          />
          {errors.email && <p className="mt-1.5 text-[11.5px] font-semibold text-[#C2603E]">{f.required}</p>}
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
            id={`${idPrefix}-message`}
            className={cn("field min-h-[120px]", errors.message && "border-[#C2603E]!")}
            placeholder={f.messagePh}
            value={fields.message}
            onChange={(e) => set("message", e.target.value)}
          />
          {errors.message && <p className="mt-1.5 text-[11.5px] font-semibold text-[#C2603E]">{f.required}</p>}
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

      {status === "delivered" && (
        <div className="mt-5 flex items-start gap-3 rounded-sm border border-sage/40 bg-sage/10 px-4 py-3.5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
          <div>
            <p className="text-[13.5px] font-bold text-ink">{f.deliveredTitle}</p>
            <p className="mt-1 text-[12.5px] leading-6 text-ink2">{f.deliveredBody}</p>
          </div>
        </div>
      )}

      {status === "mailed" && (
        <div className="mt-5 flex items-start gap-3 rounded-sm border border-line bg-surface px-4 py-3.5">
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
        <div className="mt-5 flex items-start gap-3 rounded-sm border border-[#C2603E]/40 bg-[#C2603E]/10 px-4 py-3.5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#C2603E]" />
          <div>
            <p className="text-[13.5px] font-bold text-ink">{f.timeoutTitle}</p>
            <p className="mt-1 text-[12.5px] leading-6 text-ink2">{f.timeoutBody}</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="mt-5 flex items-start gap-3 rounded-sm border border-[#C2603E]/40 bg-[#C2603E]/10 px-4 py-3.5">
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

type ContactProps = {
  variant?: "section" | "page";
};

export default function Contact({ variant = "section" }: ContactProps) {
  const { t } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const f = t.contact.form;
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [truncated, setTruncated] = useState(false);

  const rememberOpener = () => {
    const active = document.activeElement;
    previouslyFocused.current = active instanceof HTMLElement ? active : null;
  };

  const openModal = () => {
    rememberOpener();
    // Status reset happens in the hash effect when shouldOpen becomes true (#22).
    navigate({ pathname: location.pathname, search: location.search, hash: "contact/start" }, { replace: true });
  };

  const closeModal = () => {
    navigate({ pathname: location.pathname, search: location.search, hash: "contact" }, { replace: true });
  };

  useEffect(() => {
    if (variant !== "section") return;
    const shouldOpen = location.hash === START_HASH;
    if (shouldOpen && !open) {
      // Deep-link / hash open without the CTA button — capture current focus.
      if (!previouslyFocused.current) rememberOpener();
      // #22: any closed→open path (hash or button) must clear a stale banner.
      setStatus("idle");
      setTruncated(false);
    }
    setOpen(shouldOpen);
  }, [location.hash, variant]); // eslint-disable-line react-hooks/exhaustive-deps -- sync open from URL only

  useFocusTrap(dialogRef, open && variant === "section");
  useBodyScrollLock(open && variant === "section");

  useEffect(() => {
    if (variant !== "section" || !open) return;

    const root = document.getElementById("root");
    if (root) root.setAttribute("inert", "");

    const focusTimer = window.setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      if (root) root.removeAttribute("inert");
      const restore = previouslyFocused.current;
      previouslyFocused.current = null;
      // Defer so React can unmount the portal before restoring focus.
      window.setTimeout(() => restore?.focus(), 0);
    };
  }, [open, variant]); // eslint-disable-line react-hooks/exhaustive-deps -- closeModal is stable enough via navigate

  if (variant === "page") {
    return (
      <section id="contact" className="relative overflow-hidden border-t border-line bg-surface section-pad">
        <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-24 end-[-10%] h-[420px] w-[420px] rounded-full bg-hi/10 blur-3xl dark:bg-hi/5"
          aria-hidden="true"
        />

        <div className="wrap relative max-w-3xl">
          <Reveal>
            <span className="kicker">{t.contact.kicker}</span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 text-[36px] font-black leading-[1.12] tracking-tight md:text-[48px]">
              {t.contact.title}
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-xl text-[16px] font-medium leading-8 text-ink2 md:text-[17px]">{t.contact.lead}</p>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-5 max-w-xl border-s-[3px] border-hi ps-5 text-[15px] font-extrabold leading-8 tracking-tight md:text-[16px]">
              {t.contact.strong}
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="relative mt-10">
              <h2 className="text-[22px] font-black tracking-tight">{f.title}</h2>
              <p className="mt-1.5 max-w-md text-[13px] leading-6 text-ink2">{f.desc}</p>
              <div className="mt-6">
                <ContactForm
                  idPrefix="ct-page"
                  status={status}
                  setStatus={setStatus}
                  truncated={truncated}
                  setTruncated={setTruncated}
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <ContactInfoStrip />
          </Reveal>
        </div>
      </section>
    );
  }

  const modal =
    open &&
    createPortal(
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm sm:p-6"
        onClick={closeModal}
        role="presentation"
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="max-h-[min(85vh,720px)] w-full max-w-2xl overflow-y-auto rounded-lg border border-line bg-page shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-[1] flex items-start justify-between gap-4 border-b border-line bg-page/95 px-5 py-4 backdrop-blur md:px-7">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink3">{t.contact.kicker}</p>
              <h3 id={titleId} className="mt-1 text-[22px] font-black tracking-tight">
                {f.title}
              </h3>
              <p className="mt-1.5 max-w-md text-[13px] leading-6 text-ink2">{f.desc}</p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-line text-ink2 transition-colors hover:border-hi hover:text-hi"
              aria-label={t.nav.close}
            >
              <X className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>

          <div className="relative p-5 md:p-7">
            <ContactForm
              idPrefix="ct"
              firstFieldRef={firstFieldRef}
              status={status}
              setStatus={setStatus}
              truncated={truncated}
              setTruncated={setTruncated}
            />
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <section id="contact" className="relative overflow-hidden border-t border-line bg-surface section-pad">
      <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-24 end-[-10%] h-[420px] w-[420px] rounded-full bg-hi/10 blur-3xl dark:bg-hi/5"
        aria-hidden="true"
      />

      <div className="wrap relative">
        <div className="grid items-end gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <span className="kicker">{t.contact.kicker}</span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 max-w-xl text-[42px] font-black leading-[1.12] tracking-tight md:text-[56px] lg:text-[64px]">
                {t.contact.title}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-lg text-[17px] font-medium leading-8 text-ink2 md:text-[18px] md:leading-9">
                {t.contact.lead}
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-6 max-w-xl border-s-[3px] border-hi ps-5 text-[16px] font-extrabold leading-8 tracking-tight md:text-[18px]">
                {t.contact.strong}
              </p>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-10 flex flex-wrap items-center gap-3.5">
                <button type="button" onClick={openModal} className="btn btn-primary">
                  {t.contact.secondary}
                  <DirArrow className="h-[18px] w-[18px]" />
                </button>
                <a href={`mailto:${t.contact.email}`} dir="ltr" className="btn btn-ghost">
                  <Mail className="h-4 w-4" strokeWidth={2.1} />
                  {t.contact.email}
                </a>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={200}>
              <ol className="space-y-5">
                {t.contact.lines.map((line, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-line bg-page font-mono text-[11px] font-bold text-hi">
                      0{i + 1}
                    </span>
                    <p className="pt-1 text-[14.5px] font-medium leading-7 text-ink2 md:text-[15px] md:leading-8">{line}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>

        <Reveal delay={400}>
          <ContactInfoStrip />
        </Reveal>
      </div>

      {modal}
    </section>
  );
}
