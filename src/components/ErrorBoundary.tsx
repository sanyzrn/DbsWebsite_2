import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Lightweight bilingual fallback when a child throws during render.
 * Avoids a blank white page with no recovery path.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const isFa = typeof document !== "undefined" && document.documentElement.lang !== "en";

    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-6 text-ink">
        <div className="max-w-md text-center" dir={isFa ? "rtl" : "ltr"}>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">error</p>
          <h1 className="mt-4 text-[28px] font-extrabold tracking-tight">
            {isFa ? "مشکلی پیش آمد." : "Something went wrong."}
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-ink2">
            {isFa
              ? "صفحه از کار افتاد. لطفاً یک‌بار تازه کنید؛ اگر مشکل ادامه داشت، به من ایمیل بزنید تا درستش کنم."
              : "The page crashed. Please refresh once — and if it keeps happening, email me and I'll fix it."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-primary h-auto rounded-sm px-5 py-2.5 text-[13px]"
            >
              {isFa ? "تازه‌سازی صفحه" : "Reload page"}
            </button>
            <a
              href="mailto:zrn_sany@yahoo.com?subject=Portfolio%20site%20error"
              className="rounded-sm border border-line px-5 py-2.5 text-[13px] font-bold"
            >
              {isFa ? "ایمیل بزنید" : "Email me"}
            </a>
          </div>
        </div>
      </div>
    );
  }
}
