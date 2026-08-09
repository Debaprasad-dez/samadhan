"use client";

import { useCallback, useEffect, useRef } from "react";
import { plinth } from "@/lib/art/plinth";

/**
 * The citizen's plinth: their building on a round disc, ringed by a gold tier
 * arc, with one planted marker per confirmed fix and a tall pin per still-open
 * case. Repaints on theme switch.
 */
export function ProfileHero({
  fixes,
  tier,
  active,
}: {
  fixes: number;
  tier: number;
  active: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const paint = useCallback(() => {
    const host = ref.current;
    if (!host) return;
    host.querySelector("svg")?.remove();
    host.insertAdjacentHTML("afterbegin", plinth({ fixes, tier, active }));
  }, [fixes, tier, active]);

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
