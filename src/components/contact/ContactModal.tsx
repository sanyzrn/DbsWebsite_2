import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useApp } from "../../lib/app";
import type { ContactStatus } from "../../lib/mailto";
import { ContactForm } from "./ContactForm";

type ContactModalProps = {
  open: boolean;
  onClose: () => void;
  titleId: string;
  dialogRef: RefObject<HTMLDivElement | null>;
  firstFieldRef: RefObject<HTMLInputElement | null>;
  status: ContactStatus;
  setStatus: Dispatch<SetStateAction<ContactStatus>>;
  truncated: boolean;
  setTruncated: Dispatch<SetStateAction<boolean>>;
};

export function ContactModal({
  open,
  onClose,
  titleId,
  dialogRef,
  firstFieldRef,
  status,
  setStatus,
  truncated,
  setTruncated,
}: ContactModalProps) {
  const { t } = useApp();
  const f = t.contact.form;

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
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
            onClick={onClose}
            className="hit-min relative flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-line text-ink2 transition-colors hover:border-hi hover:text-hi"
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
}
