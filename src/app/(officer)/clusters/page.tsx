"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { EmptyClusters } from "@/components/art/empty";
import { formatRelative } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";

interface Cluster {
  categoryId: string;
  title: string;
  count: number;
  wards: string[];
  sample: { number: string; title: string };
}

export default function ClustersPage() {
  const t = useT();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [computedAt, setComputedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  async function load(recompute = false) {
    if (recompute) setRecomputing(true);
    else setLoading(true);
    try {
      const res = await fetch(
        `/api/officer/clusters${recompute ? "?recompute=1" : ""}`,
      );
      const d = await res.json();
      setClusters(d.clusters ?? []);
      setComputedAt(d.computedAt ?? null);
    } finally {
      setLoading(false);
      setRecomputing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            {t("officer.clusters")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("officer.clustersSub")}
            {computedAt
              ? ` · ${t("officer.clustersUpdated")} ${formatRelative(new Date(computedAt))}`
              : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => load(true)}
          disabled={recomputing}
        >
          {recomputing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          {t("officer.recompute")}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : clusters.length === 0 ? (
        <EmptyState
          illustration={<EmptyClusters />}
          title={t("officer.clustersEmpty")}
          description={t("officer.clustersEmptySub")}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {clusters.map((c) => (
            <Card key={c.categoryId}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{c.title}</p>
                  <span className="bg-brand-soft text-brand rounded-full px-2 py-0.5 text-xs font-semibold">
                    {c.count} {t("officer.casesCount")}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {c.wards.length} {t("officer.wardsLabel")}: {c.wards.join(", ")}
                </p>
                <p className="text-muted-foreground mt-1 truncate text-xs">
                  {c.sample.number} — {c.sample.title}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
