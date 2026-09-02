import { cn } from "../utils/cn";

type Variant = "full" | "icon";

const SRC: Record<Variant, string> = {
  full: "/Dbs_logo.webp",
  icon: "/Dbs_logo_single.png",
};

/**
 * Personal DbsStudio logos from /public.
 * - full → Dbs_logo.webp (wordmark / lockup)
 * - icon → light/dark mark pair, switched by the app's `.dark` theme class
 */
export default function BrandLogo({
  variant = "full",
  className,
  imgClassName,
  alt = "DbsStudio",
}: {
  variant?: Variant;
  className?: string;
  imgClassName?: string;
  alt?: string;
}) {
  if (variant === "icon") {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <img
          src={SRC.icon}
          alt={alt}
          className={cn("block h-auto w-auto select-none dark:hidden", imgClassName)}
          draggable={false}
        />
        <img
          src="/Dbs_logo_single_w.png"
          alt={alt}
          className={cn("hidden h-auto w-auto select-none dark:block", imgClassName)}
          draggable={false}
        />
      </span>
    );
  }

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
