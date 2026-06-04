"use client";

import { useEffect, useState } from "react";
import { Sparkles, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PrintButton } from "@/components/admin/print-button";

interface Digest {
  headline: string;
  narrative: string;
  interventions: string[];
}

export default function PolicyPage() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/policy/digest?period=30")
      .then((r) => r.json())
      .then((d) => setDigest(d.digest))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Policy insights</h1>
          <p className="text-muted-foreground text-sm">
            Weekly digest for the PMO · last 30 days
          </p>
        </div>
        <PrintButton label="Export brief (PDF)" />
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : digest ? (
        <article className="space-y-5">
          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="text-brand inline-flex items-center gap-1.5 text-sm font-semibold">
                <Sparkles className="h-4 w-4" /> This month
              </p>
              <h2 className="font-display text-2xl font-semibold">
                {digest.headline}
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {digest.narrative}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                <Lightbulb className="text-warning h-4 w-4" /> Recommended
                interventions
              </p>
              <ol className="list-decimal space-y-2 pl-5">
                {digest.interventions.map((it, i) => (
                  <li key={i} className="text-sm leading-relaxed">
                    {it}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </article>
      ) : (
        <p className="text-muted-foreground">Couldn&rsquo;t generate the digest.</p>
      )}
    </div>
  );
}
