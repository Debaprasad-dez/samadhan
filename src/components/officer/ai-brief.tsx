"use client";

import { useEffect } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { useSummary } from "@/hooks/use-officer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AiBrief({ caseId }: { caseId: string }) {
  const summary = useSummary();

  useEffect(() => {
    summary.mutate(caseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const lines = summary.data?.summary?.split("\n").filter(Boolean) ?? [];

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
            <Sparkles className="text-brand h-4 w-4" /> AI brief
          </p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => summary.mutate(caseId)}
            aria-label="Regenerate brief"
            disabled={summary.isPending}
          >
            {summary.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
          </Button>
        </div>
        {summary.isPending && lines.length === 0 ? (
          <p className="text-muted-foreground text-sm">Thinking…</p>
        ) : lines.length ? (
          <ul className="space-y-1 text-sm">
            {lines.map((l, i) => (
              <li key={i} className="text-muted-foreground">
                {l}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No brief available.</p>
        )}
      </CardContent>
    </Card>
  );
}
