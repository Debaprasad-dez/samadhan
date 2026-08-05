"use client";

import { useCallback, useEffect, useRef } from "react";
import { journeyRoad, type RoadStage } from "@/lib/art/journey-road";

/**
 * The case journey as a road: gate spacing is elapsed time, so the long empty
 * stretch is the delay. Barrier at the end is the charter limit; the marker is
 * where the case stands now. Repaints on theme switch; replay re-runs the build.
 */
export function CaseHero({
  stages,
  nowH,
  limitH,
  limitLabel,
  nowLabel,
}: {
  stages: RoadStage[];
  nowH: number;
  limitH: number;
  limitLabel: string;
  nowLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const paint = useCallback(() => {
    const host = ref.current;
    if (!host) return;
    host.querySelector("svg")?.remove();
    host.insertAdjacentHTML(
      "afterbegin",
      journeyRoad(stages, nowH, limitH, limitLabel, nowLabel),
    );
  }, [stages, nowH, limitH, limitLabel, nowLabel]);

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
