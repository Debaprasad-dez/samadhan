"use client";

import { useState, type ReactNode } from "react";

type Filter = "active" | "await" | "closed";

/**
 * The cases filter chips. Sets a data-filter on the wrapper; CSS hides the
 * sections the chip excludes, so the sections stay server-rendered.
 */
export function CaseFilters({
  counts,
  children,
}: {
  counts: Record<Filter, number>;
  children: ReactNode;
}) {
  const [filter, setFilter] = useState<Filter>("active");
  const CHIPS: { k: Filter; label: string }[] = [
    { k: "active", label: "Active" },
    { k: "await", label: "Awaiting you" },
    { k: "closed", label: "Closed" },
  ];

  return (
    <>
      <div className="reveal" data-d="2">
        <div className="filters" role="group" aria-label="Filter cases">
          {CHIPS.map((c) => (
            <button
              key={c.k}
              className="fchip"
              aria-pressed={filter === c.k}
              onClick={() => setFilter(c.k)}
            >
              {c.label} <span className="ct">{counts[c.k]}</span>
            </button>
          ))}
        </div>
      </div>
      <div data-filter={filter}>{children}</div>
    </>
  );
}
