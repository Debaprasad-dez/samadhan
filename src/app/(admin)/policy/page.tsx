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
        // Recommendation → evidence → impact → owner (spec §3).
        <article className="space-y-5">
          {/* 1. Recommendation (leads) */}
          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="text-brand inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
                <Lightbulb className="h-4 w-4" /> Recommendation
              </p>
              <h2 className="font-display text-2xl font-semibold">
                {digest.headline}
              </h2>
              <ol className="list-decimal space-y-2 pl-5">
                {digest.interventions.map((it, i) => (
                  <li key={i} className="text-sm leading-relaxed">
                    {it}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* 2. Evidence & impact */}
          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
                <Sparkles className="text-brand h-4 w-4" /> Evidence &amp; impact
              </p>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {digest.narrative}
              </p>
            </CardContent>
          </Card>

          {/* 3. Owner */}
          <Card className="bg-surface-muted/40">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                Owner
              </p>
              <p className="mt-1 text-sm leading-relaxed">
                The department leads and ward officers named above are accountable
                for delivery; the PMO tracks status in next month&rsquo;s digest.
              </p>
            </CardContent>
          </Card>
        </article>
      ) : (
        <p className="text-muted-foreground">Couldn&rsquo;t generate the digest.</p>
      )}
    </div>
  );
}
