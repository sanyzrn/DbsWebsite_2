import type { ComponentType, ReactNode } from "react";
import { cn } from "../../utils/cn";

export type CalloutVariant = "note" | "tip" | "warn";

const variantClass: Record<CalloutVariant, string> = {
  note: "border-ink3 bg-surface",
  tip: "border-accent bg-soft",
  warn: "border-error bg-error/10",
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
        "my-8 border-s-[3px] px-5 py-4 text-[16px] leading-relaxed text-ink md:px-6 md:py-5",
        variantClass[variant]
      )}
    >
      {title ? <p className="mb-1.5 text-[15px] font-semibold text-ink">{title}</p> : null}
      <div className="[&>p]:m-0 [&>p+p]:mt-3">{children}</div>
    </aside>
  );
}

export type ArticleMdxComponent = ComponentType<{
  components?: Record<string, ComponentType<Record<string, unknown>>>;
}>;
