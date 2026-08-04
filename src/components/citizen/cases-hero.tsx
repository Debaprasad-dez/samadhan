"use client";

import { useCallback, useEffect, useRef } from "react";
import { limitYard, type YardCase } from "@/lib/art/limit-yard";

/**
 * The limit yard: one column per case, height = elapsed / charter limit, with a
 * glass SLA plane at 100%. Columns through the glass have escalated. Repaints on
 * theme switch; the replay button re-runs the build.
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
