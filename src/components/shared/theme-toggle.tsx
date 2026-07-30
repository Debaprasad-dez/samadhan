"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";

type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

export function ThemeToggle() {
  const { resolvedMode, setMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedMode === "dark";

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next = isDark ? "light" : "dark";
    const doc = document as ViewTransitionDocument;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // No View Transitions support (or reduced motion) → plain, instant switch.
    if (!doc.startViewTransition || reduce) {
      setMode(next);
      return;
    }

    // Circular reveal growing from the toggle button. flushSync applies the mode
    // change synchronously (the selected theme is unchanged; only data-mode
    // flips) so the View Transition captures the new light/dark state.
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const end = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const vt = doc.startViewTransition(() => {
      flushSync(() => setMode(next));
    });
    vt.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${end}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 480,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      // The transition is skipped if another starts first — the mode still
      // changed (via flushSync), only the reveal animation is dropped.
      .catch(() => {});
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle light or dark mode"
      onClick={toggle}
    >
      {mounted && isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
