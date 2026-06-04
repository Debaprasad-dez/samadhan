"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Leaderboards</h1>
        <div className="flex gap-1">
          {(["7d", "30d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs",
                period === p
                  ? "border-brand bg-brand-soft text-brand"
                  : "text-muted-foreground",
              )}
            >
              {p === "7d" ? "7 days" : "30 days"}
            </button>
          ))}
        </div>
      </div>

      <Tabs value={type} onValueChange={setType}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          {TABS.map((t) => (
            <TabsTrigger key={t.k} value={t.k}>
              {t.l}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground p-10 text-center">
            Not enough activity in this period yet.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          {rows.map((r) => (
            <div
              key={`${r.rank}-${r.label}`}
              className="flex items-center gap-3 border-b px-4 py-3 last:border-0"
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  r.rank <= 3
                    ? "bg-brand text-brand-foreground"
                    : "bg-surface-muted text-muted-foreground",
                )}
              >
                {r.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{r.label}</p>
                <p className="text-muted-foreground text-xs">{r.sublabel}</p>
              </div>
              <span className="text-sm font-medium">{r.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
