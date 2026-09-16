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
    // Sized before the SVG paints, and on the same sky as its placeholder, so
    // the scene arriving never moves the page or flashes a flat block.
    <div className="hero ph" ref={ref} style={{ aspectRatio: "430 / 310" }}>
      <div className="fade" />
    </div>
  );
}
