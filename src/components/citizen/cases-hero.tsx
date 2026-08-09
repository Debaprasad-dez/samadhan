"use client";

import { useCallback, useEffect, useRef } from "react";
import { limitYard, type YardCase } from "@/lib/art/limit-yard";

/**
 * The limit yard: one column per case, height = elapsed / charter limit, with a
 * glass SLA plane at 100%. Columns through the glass have escalated. Repaints on theme switch.
 */
export function CasesHero({ cases }: { cases: YardCase[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const paint = useCallback(() => {
    const host = ref.current;
    if (!host) return;
    host.querySelector("svg")?.remove();
    host.insertAdjacentHTML("afterbegin", limitYard(cases));
  }, [cases]);

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
