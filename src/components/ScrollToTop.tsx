import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Max rAF retries while waiting for a hash target that mounts after route change. */
const HASH_SCROLL_MAX_ATTEMPTS = 20;

/** Scroll to top on pathname change; honor hash anchors after paint (with retries). */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace(/^#/, "").split("/")[0];
      let attempts = 0;
      let raf = 0;
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
        if (attempts < HASH_SCROLL_MAX_ATTEMPTS) {
          attempts += 1;
          raf = requestAnimationFrame(tryScroll);
        }
      };
      raf = requestAnimationFrame(tryScroll);
      return () => cancelAnimationFrame(raf);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
