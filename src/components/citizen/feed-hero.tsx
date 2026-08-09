"use client";

import { useCallback, useEffect, useRef } from "react";
import { radiusMap, type NearItem } from "@/lib/art/radius-map";

/**
 * The 500 m radius map: you at the centre, one marker per nearby open case at
 * its bearing and distance, with a chip stack for its co-signers. Repaints on theme switch.
 */
export function FeedHero({ items }: { items: NearItem[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const paint = useCallback(() => {
    const host = ref.current;
    if (!host) return;
    host.querySelector("svg")?.remove();
    host.insertAdjacentHTML("afterbegin", radiusMap(items));
  }, [items]);

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
