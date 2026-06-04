"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { cn, humanizeCode } from "@/lib/utils";
import type { OfficerRow } from "@/lib/admin-stats";

const COLS: { k: keyof OfficerRow; l: string; num?: boolean }[] = [
  { k: "name", l: "Officer" },
  { k: "department", l: "Dept" },
  { k: "ward", l: "Ward" },
  { k: "total", l: "Cases", num: true },
  { k: "resolvedPct", l: "Resolved %", num: true },
  { k: "avgDays", l: "Avg days", num: true },
  { k: "qualityAvg", l: "Quality", num: true },
];

export function OfficersTable({ rows }: { rows: OfficerRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ k: keyof OfficerRow; dir: 1 | -1 }>({
    k: "resolvedPct",
    dir: -1,
  });

  const filtered = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.department.toLowerCase().includes(q.toLowerCase()),
  );
  const sorted = [...filtered].sort((a, b) => {
    const av = a[sort.k];
    const bv = b[sort.k];
    if (typeof av === "number" && typeof bv === "number")
      return (av - bv) * sort.dir;
    return String(av).localeCompare(String(bv)) * sort.dir;
  });

  function toggle(k: keyof OfficerRow) {
    setSort((s) => (s.k === k ? { k, dir: (s.dir * -1) as 1 | -1 } : { k, dir: -1 }));
  }

  return (
    <div className="space-y-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search officer or department…"
        className="border-input bg-background h-9 w-full max-w-sm rounded-md border px-3 text-sm"
      />
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-muted-foreground text-xs">
            <tr>
              {COLS.map((c) => (
                <th
                  key={c.k}
                  onClick={() => toggle(c.k)}
                  className={cn(
                    "cursor-pointer select-none px-3 py-2 font-medium",
                    c.num ? "text-right" : "text-left",
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.l}
                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.id}
                onClick={() => router.push(`/officers/${r.id}`)}
                className="hover:bg-surface-muted cursor-pointer border-t"
              >
                <td className="px-3 py-2 font-medium">{r.name}</td>
                <td className="px-3 py-2">{humanizeCode(r.department)}</td>
                <td className="px-3 py-2">{r.ward}</td>
                <td className="px-3 py-2 text-right">{r.total}</td>
                <td className="px-3 py-2 text-right">{r.resolvedPct}%</td>
                <td className="px-3 py-2 text-right">{r.avgDays}</td>
                <td className="px-3 py-2 text-right">{r.qualityAvg || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
