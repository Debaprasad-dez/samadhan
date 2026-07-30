"use client";

import { useEffect, useState } from "react";
import { Boxes, Flame, Sparkles, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Cluster {
  categoryId: string;
  title: string;
  count: number;
  wards: string[];
  sample: { number: string; title: string };
}
interface Hotspot {
  ward: string;
  total: number;
  breachRate: number;
}
interface TrendsData {
  clusters: Cluster[];
  hotspots: Hotspot[];
  narrative: string;
}

export default function TrendsPage() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/trends?period=14")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Trends</h1>
        <p className="text-muted-foreground text-sm">
          Emerging clusters & hotspots · last 14 days
        </p>
      </div>

      {/* Claim → evidence → action (spec §3). */}
      {/* 1. The claim (AI root-cause narrative) */}
      <Card>
        <CardContent className="space-y-2 p-5">
          <p className="text-brand inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
            <Sparkles className="h-4 w-4" /> The claim
          </p>
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
              {data?.narrative}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 2. The evidence */}
      <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
        The evidence
      </p>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* clusters */}
        <section className="space-y-3">
          <h2 className="font-display inline-flex items-center gap-2 text-lg font-semibold">
            <Boxes className="h-5 w-5" /> Emerging clusters
          </h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : data && data.clusters.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {data.clusters.map((c) => (
                <Card key={c.categoryId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{c.title}</p>
                      <span className="bg-brand-soft text-brand rounded-full px-2 py-0.5 text-xs font-semibold">
                        {c.count}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {c.wards.length} ward(s) affected
                    </p>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      e.g. {c.sample.title}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No systemic clusters detected this period.
            </p>
          )}
        </section>

        {/* hotspots */}
        <aside className="space-y-3">
          <h2 className="font-display inline-flex items-center gap-2 text-lg font-semibold">
            <Flame className="text-warning h-5 w-5" /> SLA hotspots
          </h2>
          <Card>
            <CardContent className="space-y-2 p-4">
              {loading ? (
                <Skeleton className="h-24 w-full" />
              ) : data && data.hotspots.length > 0 ? (
                data.hotspots.map((h) => (
                  <div key={h.ward} className="flex items-center justify-between text-sm">
                    <span className="min-w-0 truncate">{h.ward}</span>
                    <span
                      className={
                        h.breachRate >= 50 ? "text-danger font-medium" : "text-muted-foreground"
                      }
                    >
                      {h.breachRate}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No hotspots.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* 3. The action — derived from the strongest evidence. */}
      {!loading && data && (data.hotspots.length > 0 || data.clusters.length > 0) && (
        <Card className="border-brand/30 bg-brand-soft/40">
          <CardContent className="space-y-2 p-5">
            <p className="text-brand inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
              <Target className="h-4 w-4" /> The action
            </p>
            <ul className="space-y-1 text-sm">
              {data.hotspots[0] && (
                <li>
                  Prioritise <b>{data.hotspots[0].ward}</b> —{" "}
                  <span className="tabular-nums">{data.hotspots[0].breachRate}%</span>{" "}
                  of cases breaching SLA.
                </li>
              )}
              {data.clusters[0] && (
                <li>
                  Investigate the <b>{data.clusters[0].title}</b> cluster —{" "}
                  <span className="tabular-nums">{data.clusters[0].count}</span> cases
                  across {data.clusters[0].wards.length} ward(s).
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
