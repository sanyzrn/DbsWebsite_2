import { useEffect, useId, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ArrowUp, FolderKanban, Home, Mail, UserRound } from "lucide-react";
import { useApp } from "../lib/app";
import { usePrefersReducedMotion } from "../lib/motion";
import { localePath, stripLangPrefix } from "../lib/paths";
import { cn } from "../utils/cn";

const SCROLL_THRESHOLD = 400;

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
 * Registration target that turns into a close mark: rotating it 45° turns the
 * crosshair into an ×, while the ring and centre dot shrink away.
 */
function RegToggleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="fqn-toggle-icon" aria-hidden="true">
      <circle className="fqn-ring" cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.6" />
      <circle className="fqn-dot" cx="12" cy="12" r="2.2" fill="currentColor" />
      <path d="M12 2.5v19M2.5 12h19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Quick-nav dock for phones/tablets (hidden from lg up via CSS).
 *
 * Closed by default: a single registration-mark button, bottom-right. Tapping it
 * unfolds a strip of destinations out of the button; each label "prints in" —
 * cyan/magenta ghosts settle into register, echoing the hero. The mark rotates
 * into a close ×. Escape, an outside tap, or navigating closes it again.
 *
 * Nav and scroll-to-top stay independent fixed elements (bottom-right / bottom-left).
 */
export default function FloatingQuickNav() {
  const { t, lang } = useApp();
  const { pathname } = useLocation();
  const reduceMotion = usePrefersReducedMotion();
  const showTop = useScrollPast(SCROLL_THRESHOLD);
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const panelId = useId();

  // Any navigation closes the dock.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent | MouseEvent) => {
      if (e.target instanceof Node && !navRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown as unknown as EventListener, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown as unknown as EventListener);
    };
  }, [open]);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const items = [
    { key: "home" as const, to: localePath(lang, "/"), label: t.nav.home, Icon: Home },
    { key: "projects" as const, to: localePath(lang, "/projects"), label: t.nav.projects, Icon: FolderKanban },
    { key: "about" as const, to: localePath(lang, "/about"), label: t.nav.about, Icon: UserRound },
    { key: "contact" as const, to: localePath(lang, "/contact"), label: t.nav.contact, Icon: Mail },
  ];

  return (
    <div className="floating-quick-nav print:hidden" data-reduce-motion={reduceMotion ? "true" : "false"}>
      <nav
        ref={navRef}
        className={cn("fqn-nav", open && "is-open")}
        aria-label={t.nav.quick}
        data-fqn-corner="bottom-right"
      >
        <div id={panelId} className="fqn-panel" inert={!open}>
          <ul className="fqn-list">
            {items.map(({ key, to, label, Icon }) => {
              const active = isNavActive(pathname, key);
              return (
                <li key={key}>
                  <NavLink
                    to={to}
                    end={key === "home"}
                    onClick={() => setOpen(false)}
                    className={cn("fqn-item", active && "fqn-item-active")}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="fqn-icon" strokeWidth={active ? 2.2 : 1.9} aria-hidden="true" />
                    <span className="fqn-label">{label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          type="button"
          className="fqn-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? t.nav.quickClose : t.nav.quickOpen}
          onClick={() => setOpen((o) => !o)}
        >
          <RegToggleIcon />
        </button>
      </nav>

      {showTop && !open ? (
        <button
          type="button"
          className="fqn-scroll-btn"
          data-fqn-corner="bottom-left"
          onClick={scrollTop}
          aria-label={t.footer.backTop}
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
