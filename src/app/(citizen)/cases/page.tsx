"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useCases } from "@/hooks/use-cases";
import { CaseCard } from "@/components/case/case-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { EmptyCases } from "@/components/art/empty";
import { cn } from "@/lib/utils";

const FILTERS = [
  { k: "all", l: "All" },
  { k: "open", l: "Open" },
  { k: "in-progress", l: "In progress" },
  { k: "resolved", l: "Resolved" },
  { k: "escalated", l: "Escalated" },
];

export default function CasesPage() {
  const [status, setStatus] = useState("all");
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError, refetch, isFetching } = useCases({
    status,
    page: 1,
    limit,
  });

  const cases = data?.cases ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">My cases</h1>
        <Button asChild size="sm">
          <Link href="/file">File new</Link>
        </Button>
      </div>

      {/* filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.k}
            onClick={() => {
              setStatus(f.k);
              setLimit(10);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              status === f.k
                ? "border-brand bg-brand-soft text-brand"
                : "text-muted-foreground hover:bg-surface-muted",
            )}
          >
            {f.l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-muted-foreground">Couldn&rsquo;t load your cases.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : cases.length === 0 ? (
        <EmptyState
          illustration={<EmptyCases />}
          title="No complaints yet"
          description="Your civic journey starts here. File your first complaint to track it like a service journey."
          action={
            <Button asChild>
              <Link href="/file">File your first complaint →</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-2">
            {cases.map((c) => (
              <CaseCard key={c.id} c={c} />
            ))}
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-muted-foreground text-xs">
              Showing {cases.length} of {total}
            </p>
            {cases.length < total && (
              <Button
                variant="outline"
                onClick={() => setLimit((l) => l + 10)}
                disabled={isFetching}
              >
                {isFetching && <Loader2 className="animate-spin" />}
                Load more
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
