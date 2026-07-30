"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// DataTable (design spec §2.4): numeric columns right-aligned, hairline row
// borders, NO zebra striping, ~11px vertical padding, a sort indicator on the
// active column, and a footer stating the row count (+ any marker convention).

export interface Column<T> {
  key: string;
  header: string;
  numeric?: boolean;
  sortable?: boolean;
  /** Value used for sorting; defaults to (row as Record)[key]. */
  sortValue?: (row: T) => number | string;
  render?: (row: T) => ReactNode;
  className?: string;
}

type SortState = { key: string; dir: "asc" | "desc" } | null;

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  initialSort = null,
  footerNote,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T, i: number) => string | number;
  initialSort?: SortState;
  /** Convention note shown in the footer beside the row count. */
  footerNote?: string;
  className?: string;
}) {
  const [sort, setSort] = useState<SortState>(initialSort);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const val = (row: T): number | string =>
      col.sortValue
        ? col.sortValue(row)
        : ((row as Record<string, unknown>)[col.key] as number | string);
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = val(a);
      const bv = val(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [rows, sort, columns]);

  const toggleSort = (key: string) =>
    setSort((s) =>
      s?.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm tabular-nums">
        <thead>
          <tr className="border-border border-b">
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const Indicator = !c.sortable
                ? null
                : active
                  ? sort!.dir === "asc"
                    ? ArrowUp
                    : ArrowDown
                  : ChevronsUpDown;
              return (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    "text-muted-foreground px-3 py-[11px] text-xs font-semibold uppercase tracking-wide",
                    c.numeric ? "text-right" : "text-left",
                    c.sortable && "cursor-pointer select-none",
                    c.className,
                  )}
                  onClick={c.sortable ? () => toggleSort(c.key) : undefined}
                  aria-sort={
                    active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined
                  }
                >
                  <span
                    className={cn(
                      "inline-flex items-center gap-1",
                      c.numeric && "flex-row-reverse",
                    )}
                  >
                    {c.header}
                    {Indicator && (
                      <Indicator
                        className={cn("h-3 w-3", active ? "text-foreground" : "opacity-40")}
                        aria-hidden
                      />
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={getRowKey(row, i)} className="border-border/60 border-b last:border-0">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-3 py-[11px]",
                    c.numeric ? "text-right" : "text-left",
                    c.className,
                  )}
                >
                  {c.render
                    ? c.render(row)
                    : String((row as Record<string, unknown>)[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-muted-foreground mt-2 px-3 text-xs">
        {sorted.length} {sorted.length === 1 ? "row" : "rows"}
        {footerNote ? ` · ${footerNote}` : ""}
      </p>
    </div>
  );
}
