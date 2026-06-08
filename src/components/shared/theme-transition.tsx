"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/components/providers/theme-provider";

// Themed switch transition (design addendum §8.4): a radial motif wipe in the
// NEW theme's colour sweeps across when the theme changes — switching feels like
// an event. Skipped entirely under prefers-reduced-motion.
export function ThemeTransition() {
  const { theme } = useTheme();
  const [burst, setBurst] = useState<{ id: number; theme: string } | null>(
    null,
  );
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const id = Date.now();
    setBurst({ id, theme });
    const t = setTimeout(() => setBurst(null), 720);
    return () => clearTimeout(t);
  }, [theme]);

  if (!burst || typeof document === "undefined") return null;

  return createPortal(
    <div
      data-theme={burst.theme}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] grid place-items-center overflow-hidden"
    >
      <span key={burst.id} className="theme-wipe" />
    </div>,
    document.body,
  );
}
