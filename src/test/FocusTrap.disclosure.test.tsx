import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { useFocusTrap } from "../lib/useFocusTrap";
import { useBodyScrollLock } from "../lib/useBodyScrollLock";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

function DisclosureDialog() {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true);
  return <div ref={ref}>
    <details>
      <summary>Optional details</summary>
      <input aria-label="Hidden field" />
    </details>
    <button>Send</button>
    <div style={{ display: "none" }}><button>Hidden action</button></div>
  </div>;
}

function Lock({ active }: { active: boolean }) {
  useBodyScrollLock(active);
  return null;
}

describe("dialog keyboard and scroll containment", () => {
  it("wraps to the disclosure summary and skips controls inside hidden content", async () => {
    const user = userEvent.setup();
    render(<DisclosureDialog />);
    screen.getByRole("button", { name: "Send" }).focus();
    await user.tab();
    expect(screen.getByText("Optional details")).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Send" })).toHaveFocus();
  });

  it("keeps scrolling locked until all overlays release it", () => {
    document.body.style.overflow = "clip";
    const view = render(<><Lock active /><Lock active /></>);
    expect(document.body.style.overflow).toBe("hidden");
    view.rerender(<><Lock active={false} /><Lock active /></>);
    expect(document.body.style.overflow).toBe("hidden");
    view.rerender(<><Lock active={false} /><Lock active={false} /></>);
    expect(document.body.style.overflow).toBe("clip");
  });
});
