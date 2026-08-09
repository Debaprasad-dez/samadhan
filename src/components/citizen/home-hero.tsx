"use client";

import { useCallback, useEffect, useRef } from "react";
import { island } from "@/lib/art/ward-island";

/**
 * The isometric ward island. Repainted whenever the theme changes so each theme
 * gets its own cinematic entrance.
 * `pct` of the windows are lit — the share of complaints resolved this month.
 */
export function HomeHero({ pct }: { pct: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const paint = useCallback(() => {
    const host = ref.current;
    if (!host) return;
    host.querySelector("svg")?.remove();
    host.insertAdjacentHTML("afterbegin", island(pct));
  }, [pct]);

  useEffect(() => {
    paint();
    // Replay the build on every theme switch.
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
