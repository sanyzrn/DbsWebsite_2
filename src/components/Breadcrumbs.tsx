import { Fragment } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../lib/app";
import { cn } from "../utils/cn";

export type BreadcrumbItem = {
  /** Visible label */
  label: string;
  /** Locale-aware path for links; omit on the current (last) crumb */
  to?: string;
};

/**
 * Visible trail matching BreadcrumbList JSON-LD on detail pages.
 * Last item is the current page (not a link).
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  const { t } = useApp();
  if (items.length === 0) return null;

  return (
    <nav aria-label={t.nav.breadcrumbLabel} className={cn(className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold text-ink2">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={`${item.label}-${i}`}>
              {i > 0 ? (
                <li aria-hidden="true" className="select-none text-ink3">
                  /
                </li>
              ) : null}
              <li className={cn(isLast && "text-ink")}>
                {isLast || !item.to ? (
                  <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
                ) : (
                  <Link to={item.to} className="transition-colors hover:text-hi">
                    {item.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
