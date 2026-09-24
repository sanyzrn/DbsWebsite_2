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
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-[10px] border border-line bg-page shadow-[var(--shadow-sheet)] sm:max-h-[min(88vh,760px)] sm:rounded-[6px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-[1] flex items-start justify-between gap-4 border-b border-line bg-page/95 px-5 py-4 backdrop-blur md:px-7">
          <div>
            <h3 id={titleId} className="display text-[2rem] leading-none">
              {f.title}
            </h3>
            <p className="mt-3 max-w-md text-[14px] leading-6 text-ink2">{f.desc}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hit-min relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line2 text-ink transition-colors hover:bg-surface"
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
