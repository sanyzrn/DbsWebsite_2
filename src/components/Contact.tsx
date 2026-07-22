import { useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useApp } from "../lib/app";
import { type ContactStatus } from "../lib/mailto";
import { useBodyScrollLock } from "../lib/useBodyScrollLock";
import { useFocusTrap } from "../lib/useFocusTrap";
import { DirArrow, Reveal, DecorativeGrid } from "./ui";
import { ContactForm } from "./contact/ContactForm";
import { ContactInfo } from "./contact/ContactInfo";
import { ContactModal } from "./contact/ContactModal";

const START_HASH = "#contact/start";

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
  const [status, setStatus] = useState<ContactStatus>("idle");
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
        <DecorativeGrid />
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
            <ContactInfo />
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="relative overflow-hidden border-t border-line bg-surface section-pad">
      <DecorativeGrid />
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
          <ContactInfo />
        </Reveal>
      </div>

      <ContactModal
        open={open}
        onClose={closeModal}
        titleId={titleId}
        dialogRef={dialogRef}
        firstFieldRef={firstFieldRef}
        status={status}
        setStatus={setStatus}
        truncated={truncated}
        setTruncated={setTruncated}
      />
    </section>
  );
}
