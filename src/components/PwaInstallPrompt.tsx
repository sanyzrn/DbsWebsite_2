import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useApp } from "../lib/app";

const DISMISS_KEY = "sz-pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Lightweight, dismissible install affordance.
 * Never calls prompt() without a user gesture; remembers dismissal in localStorage.
 */
export default function PwaInstallPrompt() {
  const { t } = useApp();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setDeferred(null);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      /* ignore */
    }
    setDeferred(null);
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (!visible || !deferred) return null;

  return (
    <div
      className="pwa-install print:hidden"
      role="dialog"
      aria-label={t.pwa.installTitle}
      aria-describedby="pwa-install-body"
    >
      <div className="pwa-install-shell">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-extrabold tracking-tight text-ink">{t.pwa.installTitle}</p>
          <p id="pwa-install-body" className="mt-0.5 text-[12px] leading-5 text-ink2">
            {t.pwa.installBody}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" className="pwa-install-btn" onClick={() => void install()}>
            <Download className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
            {t.pwa.install}
          </button>
          <button
            type="button"
            className="pwa-install-dismiss"
            onClick={dismiss}
            aria-label={t.pwa.dismiss}
          >
            <X className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
