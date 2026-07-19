import { useEffect, useState, type CSSProperties } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ArrowUp, FolderKanban, Home, Mail, UserRound } from "lucide-react";
import { useApp } from "../lib/app";
import { localePath, stripLangPrefix } from "../lib/paths";
import { cn } from "../utils/cn";

/** Tunable layout offsets — change here without hunting through CSS. */
const FQN = {
  /** Desktop inset from the physical corners (bottom-right nav, bottom-left scroll). */
  desktopInsetPx: 24,
  /** Mobile inset from the physical corners, above the home indicator / safe area. */
  mobileBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
  /** Mobile horizontal inset from the physical left/right edges. */
  mobileSidePx: 16,
  scrollThreshold: 400,
} as const;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function useScrollPast(threshold: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      setPast(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [threshold]);
  return past;
}

function isNavActive(pathname: string, item: "home" | "projects" | "about" | "contact") {
  const bare = stripLangPrefix(pathname);
  if (item === "home") return bare === "/";
  if (item === "projects") return bare === "/projects" || bare.startsWith("/projects/");
  if (item === "contact") return bare === "/contact" || bare.startsWith("/contact/");
  return bare === "/about" || bare.startsWith("/about/");
}

/**
 * Always-visible quick-nav dock (glass pill). Complements — does not replace — Nav.tsx.
 *
 * Nav pill and scroll-to-top are independent fixed elements:
 * - Nav: physical bottom-right on mobile and desktop
 * - Scroll-to-top: physical bottom-left on mobile and desktop (same bottom offset)
 */
export default function FloatingQuickNav() {
  const { t, lang } = useApp();
  const { pathname } = useLocation();
  const reduceMotion = usePrefersReducedMotion();
  const showTop = useScrollPast(FQN.scrollThreshold);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const items = [
    { key: "home" as const, to: localePath(lang, "/"), label: t.nav.home, Icon: Home },
    { key: "projects" as const, to: localePath(lang, "/projects"), label: t.nav.projects, Icon: FolderKanban },
    { key: "about" as const, to: localePath(lang, "/about"), label: t.nav.about, Icon: UserRound },
    { key: "contact" as const, to: localePath(lang, "/contact"), label: t.nav.contact, Icon: Mail },
  ];

  const cssVars = {
    "--fqn-desktop-inset": `${FQN.desktopInsetPx}px`,
    "--fqn-mobile-bottom": FQN.mobileBottom,
    "--fqn-mobile-side": `${FQN.mobileSidePx}px`,
  } as CSSProperties;

  return (
    <div
      className="floating-quick-nav print:hidden"
      style={cssVars}
      data-reduce-motion={reduceMotion ? "true" : "false"}
    >
      <nav className="fqn-nav" aria-label={t.nav.quick} data-fqn-corner="bottom-right">
        {items.map(({ key, to, label, Icon }) => {
          const active = isNavActive(pathname, key);
          return (
            <NavLink
              key={key}
              to={to}
              end={key === "home"}
              className={cn("fqn-item", active && "fqn-item-active")}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="fqn-icon" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
              <span className={cn("fqn-label", active && "fqn-label-active")}>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {showTop ? (
        <button
          type="button"
          className="fqn-scroll-btn"
          data-fqn-corner="bottom-left"
          onClick={scrollTop}
          aria-label={t.footer.backTop}
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
