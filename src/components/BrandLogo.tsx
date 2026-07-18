import { cn } from "../utils/cn";

type Variant = "full" | "icon";

const SRC: Record<Variant, string> = {
  full: "/Dbs_logo.webp",
  icon: "/Dbs_logo_single.webp",
};

/**
 * Personal DBSGraphic logos from /public.
 * - full → Dbs_logo.webp (wordmark / lockup)
 * - icon → Dbs_logo_single.webp (mark only)
 */
export default function BrandLogo({
  variant = "full",
  className,
  imgClassName,
  alt = "DBSGraphic",
}: {
  variant?: Variant;
  className?: string;
  imgClassName?: string;
  alt?: string;
}) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={SRC[variant]}
        alt={alt}
        className={cn("block h-auto w-auto select-none", imgClassName)}
        draggable={false}
      />
    </span>
  );
}
