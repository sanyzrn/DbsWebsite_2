import { useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../lib/app";
import { type ContactStatus } from "../lib/mailto";
import { useBodyScrollLock } from "../lib/useBodyScrollLock";
import { useFocusTrap } from "../lib/useFocusTrap";
import { RegMark } from "./ui";
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

  const lines = (
    <ul className="border-t border-line">
      {t.contact.lines.map((line) => (
        <li key={line} className="border-b border-line py-4 text-[16px] text-ink2">
          {line}
        </li>
      ))}
    </ul>
  );

  if (variant === "page") {
    return (
      <section id="contact" className="pb-[clamp(72px,9vw,160px)] pt-10 md:pt-16">
        <div className="wrap">
          <div className="sheet">
            <p className="kicker lg:col-span-3 lg:pt-3">
              <RegMark className="h-3.5 w-3.5 text-accent" />
              {t.contact.kicker}
            </p>
            <div className="lg:col-span-9">
              <h1 className="display t-page max-w-[12ch]">{t.contact.title}</h1>
              <p className="lead measure mt-6 md:mt-8">{t.contact.lead}</p>
            </div>
          </div>

          <div className="sheet mt-8 gap-y-10 md:mt-14 lg:mt-20">
            <div className="lg:col-span-6 lg:col-start-4">
              <div className="border-t border-ink pt-8">
                <h2 className="text-[22px] font-semibold">{f.title}</h2>
                <p className="mt-2 max-w-[52ch] text-[15px] text-ink2">{f.desc}</p>
                <div className="mt-8">
                  <ContactForm
                    idPrefix="ct-page"
                    status={status}
                    setStatus={setStatus}
                    truncated={truncated}
                    setTruncated={setTruncated}
                  />
                </div>
              </div>
            </div>
            <aside className="lg:col-span-3 lg:col-start-10">
              <p className="text-[17px] font-semibold">{t.contact.strong}</p>
              <div className="mt-6">{lines}</div>
            </aside>
          </div>

          <div className="sheet">
            <div className="lg:col-span-9 lg:col-start-4">
              <ContactInfo />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="section-pad border-t border-line bg-surface">
      <div className="wrap">
        <div className="sheet">
          <p className="kicker lg:col-span-3 lg:pt-3">
            <RegMark className="h-3.5 w-3.5 text-accent" />
            {t.contact.kicker}
          </p>
          <div className="lg:col-span-9">
            <h2 className="display t-page max-w-[12ch]">{t.contact.title}</h2>
            <p className="lead measure mt-6 md:mt-8">{t.contact.lead}</p>
          </div>
        </div>

        <div className="sheet mt-8 gap-y-10 md:mt-14 lg:mt-20">
          <div className="lg:col-span-5 lg:col-start-4">
            <p className="t-sub display max-w-[22ch]">{t.contact.strong}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
              <button type="button" onClick={openModal} className="btn btn-primary">
                {t.contact.secondary}
              </button>
              <a href={`mailto:${t.contact.email}`} dir="ltr" className="link text-[15px] font-semibold">
                {t.contact.email}
              </a>
            </div>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">{lines}</div>
        </div>

        <div className="sheet">
          <div className="lg:col-span-9 lg:col-start-4">
            <ContactInfo />
          </div>
        </div>
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
