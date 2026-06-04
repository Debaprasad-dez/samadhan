"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import type { Severity } from "@/types";

export function SlaPredictChip({
  departmentCode,
  categoryId,
  wardCode,
  severity,
}: {
  departmentCode: string;
  categoryId: string;
  wardCode: string;
  severity: Severity;
}) {
  const [data, setData] = useState<{
    expectedDays: number;
    confidence: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/sla-predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ departmentCode, categoryId, wardCode, severity }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.expectedDays === "number") setData(d);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <span className="text-muted-foreground text-xs">
        Predicting resolution…
      </span>
    );
  }
  if (!data) return null;

  return (
    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
      <Clock className="h-3.5 w-3.5" />
      AI predicts ~{data.expectedDays}d ({Math.round(data.confidence * 100)}%
      confidence)
    </span>
  );
}
