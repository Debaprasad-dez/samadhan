"use client";

import { useCallback, useEffect, useRef } from "react";
import { journeyRoad, type RoadStage } from "@/lib/art/journey-road";

/**
 * The case journey as a road: gate spacing is elapsed time, so the long empty
 * stretch is the delay. Barrier at the end is the charter limit; the marker is
 * where the case stands now. Repaints on theme switch.
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
      <div className="fade" />
    </div>
  );
}
