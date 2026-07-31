"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LeaderRow {
  rank: number;
  label: string;
  sublabel: string;
  score: string;
}

const TABS = [
  { k: "wards", l: "Wards" },
  { k: "officers", l: "Officers" },
  { k: "citizens", l: "Citizens" },
];

export default function LeaderboardPage() {
  const [type, setType] = useState("wards");
  const [period, setPeriod] = useState<"7d" | "30d">("30d");
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/public/leaderboard?type=${type}&period=${period}`)
      .then((r) => r.json())
      .then((d) => setRows(d.rows ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [type, period]);

  const heading = TABS.find((t) => t.k === type)?.l ?? "Wards";

  return (
    <div className="mk space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Leaderboards</h1>
        <div className="chips">
          {(["7d", "30d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn("chip", period === p && "on")}
            >
              {p === "7d" ? "7 days" : "30 days"}
            </button>
          ))}
        </div>
      </div>

      <div className="chips">
        {TABS.map((t) => (
          <button
            key={t.k}
            onClick={() => setType(t.k)}
            className={cn("chip", type === t.k && "on")}
          >
            {t.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="card">
          <div className="cb" style={{ textAlign: "center", color: "var(--u-muted)" }}>
            Not enough activity in this period yet.
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="ch">
            <b>{heading} performance</b>
            <span className="m">RANKED</span>
          </div>
          {rows.map((r) => {
            const m = r.score.match(/(\d+)/);
            const pct = m ? Number(m[1]) : null;
            const barColor =
              pct == null
                ? "var(--u-brand)"
                : pct >= 70
                  ? "var(--u-ok)"
                  : pct >= 40
                    ? "var(--u-warn)"
                    : "var(--u-dang)";
            return (
              <div key={`${r.rank}-${r.label}`} className="row">
                <div
                  className="mono"
                  style={{ width: 22, color: "var(--u-faint)", fontSize: 11, paddingTop: 2 }}
                >
                  {r.rank}
                </div>
                <div className="mn">
                  <div className="t1">{r.label}</div>
                  {pct != null ? (
                    <div style={{ marginTop: 7 }}>
                      <div className="trk" style={{ height: 5 }}>
                        <i style={{ width: `${Math.min(100, pct)}%`, background: barColor }} />
                        <u style={{ left: "75%" }} />
                      </div>
                    </div>
                  ) : (
                    <div className="t2">{r.sublabel}</div>
                  )}
                </div>
                <div className="rt" style={{ width: 66 }}>
                  <div className="t1" style={{ color: pct != null ? barColor : undefined }}>
                    {r.score}
                  </div>
                  <div className="t2">{pct != null ? r.sublabel : ""}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invariant 6 — points/rank accrue on confirmed outcomes only. */}
      <div className="card">
        <div className="cb">
          <div className="aihint">
            Points and rank come only from cases <b>confirmed resolved</b> —
            filing a complaint earns nothing on its own, by design.
          </div>
        </div>
      </div>
    </div>
  );
}
