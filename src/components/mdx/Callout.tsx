import type { ComponentType, ReactNode } from "react";
import { cn } from "../../utils/cn";

export type CalloutVariant = "note" | "tip" | "warn";

const variantClass: Record<CalloutVariant, string> = {
  note: "border-line bg-surface text-ink2",
  tip: "border-hi/40 bg-hi/8 text-ink2",
  warn: "border-[#C2603E]/40 bg-[#C2603E]/10 text-ink2",
};

/**
 * Minimal MDX aside for articles. Keep the component whitelist small —
 * add new MDX components only when a real article needs them.
 */
export function Callout({
  children,
  variant = "note",
  title,
}: {
  children: ReactNode;
  variant?: CalloutVariant;
  title?: string;
}) {
  return (
    <aside
      className={cn(
        "my-6 rounded-sm border px-4 py-3.5 text-[14.5px] leading-7 md:px-5 md:py-4",
        variantClass[variant]
      )}
    >
      {title ? <p className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-ink3">{title}</p> : null}
      <div className="[&>p]:m-0 [&>p+p]:mt-3">{children}</div>
    </aside>
  );
}

export type ArticleMdxComponent = ComponentType<{
  components?: Record<string, ComponentType<Record<string, unknown>>>;
}>;
