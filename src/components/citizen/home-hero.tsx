"use client";

import { useCallback, useEffect, useRef } from "react";
import { island } from "@/lib/art/ward-island";

/**
 * The isometric ward island. Repainted whenever the theme changes so each theme
 * gets its own cinematic entrance, and on demand via the replay button.
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
      <button className="replay" onClick={paint} aria-label="Replay animation">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12a8 8 0 1 1-2.6-5.9" />
          <path d="M20 4v5h-5" />
        </svg>
      </button>
      <div className="fade" />
    </div>
  );
}
