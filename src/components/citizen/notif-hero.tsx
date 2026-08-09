"use client";

import { useCallback, useEffect, useRef } from "react";
import { sortBench } from "@/lib/art/sort-bench";

/**
 * The sorting bench: obligations stand upright in the left tray, updates lie
 * flat in the right. Repaints on theme switch.
 */
export function NotifHero({ needs, updates }: { needs: number; updates: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const paint = useCallback(() => {
    const host = ref.current;
    if (!host) return;
    host.querySelector("svg")?.remove();
    host.insertAdjacentHTML("afterbegin", sortBench(needs, updates));
  }, [needs, updates]);

  useEffect(() => {
    paint();
    const mo = new MutationObserver(paint);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => mo.disconnect();
  }, [paint]);

  return (
    <div className="hero" ref={ref}>
      <div className="fade" />
    </div>
  );
}
