import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ArrowUp, FolderKanban, Home, UserRound } from "lucide-react";
import { useApp } from "../lib/app";
import { localePath, stripLangPrefix } from "../lib/paths";
import { cn } from "../utils/cn";

/** Tunable layout offsets — change here without hunting through CSS. */
const FQN = {
  /** Desktop dock inset from physical bottom-right (stays bottom-right in RTL too). */
  desktopInsetPx: 24,
  /** Header is 72px; clear it + gap below safe-area. */
  mobileTop: "calc(env(safe-area-inset-top, 0px) + 80px)",
  scrollThreshold: 400,
  gooMs: 520,
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

function isNavActive(pathname: string, item: "home" | "projects" | "about") {
  const bare = stripLangPrefix(pathname);
  if (item === "home") return bare === "/";
  if (item === "projects") return bare === "/projects" || bare.startsWith("/projects/");
  return bare === "/about" || bare.startsWith("/about/");
}

/**
 * Always-visible quick-nav dock (glass pill). Complements — does not replace — Nav.tsx.
 *
 * Desktop corner uses physical `right` so the dock stays bottom-right in both LTR and RTL
 * (avoids colliding with start-side chrome / reading flow). Mobile is horizontally centered.
 */
export default function FloatingQuickNav() {
  const { t, lang } = useApp();
  const { pathname } = useLocation();
  const reduceMotion = usePrefersReducedMotion();
  const scrolled = useScrollPast(FQN.scrollThreshold);
  const filterUid = useId().replace(/:/g, "");
  const gooFilterId = `quicknav-goo-${filterUid}`;

  const [topMounted, setTopMounted] = useState(false);
  const [topExpanded, setTopExpanded] = useState(false);
  const [gooing, setGooing] = useState(false);
  const wasShown = useRef(false);

  useEffect(() => {
    if (scrolled) {
      wasShown.current = true;
      setTopMounted(true);
      if (reduceMotion) {
        setTopExpanded(true);
        setGooing(false);
        return;
      }
      setGooing(true);
      const id = requestAnimationFrame(() => setTopExpanded(true));
      return () => cancelAnimationFrame(id);
    }

    if (!wasShown.current) return;

    setTopExpanded(false);
    if (reduceMotion) {
      setGooing(false);
      const t = window.setTimeout(() => {
        wasShown.current = false;
        setTopMounted(false);
      }, 160);
      return () => window.clearTimeout(t);
    }
    setGooing(true);
    const t = window.setTimeout(() => {
      wasShown.current = false;
      setTopMounted(false);
      setGooing(false);
    }, FQN.gooMs);
    return () => window.clearTimeout(t);
  }, [scrolled, reduceMotion]);

  const onBlobAnimEnd = useCallback(() => {
    if (topExpanded && scrolled) setGooing(false);
  }, [topExpanded, scrolled]);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const items = [
    { key: "home" as const, to: localePath(lang, "/"), label: t.nav.home, Icon: Home },
    { key: "projects" as const, to: localePath(lang, "/projects"), label: t.nav.projects, Icon: FolderKanban },
    { key: "about" as const, to: localePath(lang, "/about"), label: t.nav.about, Icon: UserRound },
  ];

  const topFocusable = scrolled && topExpanded && topMounted;

  return (
    <div
      className="floating-quick-nav print:hidden"
      style={
        {
          "--fqn-desktop-inset": `${FQN.desktopInsetPx}px`,
          "--fqn-mobile-top": FQN.mobileTop,
          "--fqn-goo-ms": `${FQN.gooMs}ms`,
        } as CSSProperties
      }
      data-gooing={gooing && !reduceMotion ? "true" : "false"}
      data-reduce-motion={reduceMotion ? "true" : "false"}
    >
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <filter id={gooFilterId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="fqn-shell">
        {/* Background shapes only — goo filter targets this layer */}
        <div
          className={cn("fqn-goo-layer", gooing && !reduceMotion && "fqn-goo-active")}
          style={gooing && !reduceMotion ? { filter: `url(#${gooFilterId})` } : undefined}
          aria-hidden="true"
        >
          <div className="fqn-pill-bg" />
          {topMounted && (
            <div
              className={cn(
                "fqn-scroll-bg",
                topExpanded ? "fqn-scroll-bg-in" : "fqn-scroll-bg-out",
                reduceMotion && "fqn-scroll-bg-reduced"
              )}
              onAnimationEnd={onBlobAnimEnd}
            />
          )}
        </div>

        {/* Crisp foreground — never filtered */}
        <div className="fqn-fore">
          <nav className="fqn-nav" aria-label={t.nav.quick}>
            {items.map(({ key, to, label, Icon }) => {
              const active = isNavActive(pathname, key);
              return (
                <NavLink key={key} to={to} end={key === "home"} className={cn("fqn-item", active && "fqn-item-active")} aria-current={active ? "page" : undefined}>
                  <Icon className="fqn-icon" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                  <span className={cn("fqn-label", active && "fqn-label-active")}>{label}</span>
                </NavLink>
              );
            })}
          </nav>

          {topMounted && (
            <button
              type="button"
              className={cn(
                "fqn-scroll-btn",
                topExpanded ? "fqn-scroll-btn-in" : "fqn-scroll-btn-out",
                reduceMotion && "fqn-scroll-btn-reduced"
              )}
              onClick={scrollTop}
              aria-label={t.footer.backTop}
              tabIndex={topFocusable ? 0 : -1}
              aria-hidden={topFocusable ? undefined : true}
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
