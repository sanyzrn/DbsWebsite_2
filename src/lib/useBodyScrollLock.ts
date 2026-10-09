import { useEffect } from "react";

let locks = 0;
let previousOverflow = "";

/** Lock `document.body` scroll while `locked` is true; restore previous overflow on cleanup. */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    if (locks === 0) previousOverflow = document.body.style.overflow;
    locks += 1;
    document.body.style.overflow = "hidden";
    return () => {
      locks -= 1;
      if (locks === 0) document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
}
