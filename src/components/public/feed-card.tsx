"use client";

import { useState } from "react";
import Link from "next/link";
import { ThumbsUp, Users, MapPin, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge, SeverityChip } from "@/components/case/status-badge";
import { CategoryIcon } from "@/components/art/category-icon";
import { Card, CardContent } from "@/components/ui/card";
import { cn, humanizeCode, formatRelative } from "@/lib/utils";
import type { CaseStatus, Severity } from "@/types";

export interface FeedItem {
  id: string;
  number: string;
  wardCode: string;
  author: string;
  departmentCode: string;
  categoryName: string;
  status: CaseStatus;
  severity: string;
  snippet: string;
  upvotes: number;
  cosigns: number;
  createdAt: string;
  slaDueAt: string;
  escalated: boolean;
  viewerUpvoted?: boolean;
  isOwn?: boolean;
}

// Severity → a left accent bar, so urgency reads at a glance.
const SEV_ACCENT: Record<string, string> = {
  HIGH: "border-l-danger",
  MEDIUM: "border-l-warning",
  LOW: "border-l-info",
};

export function FeedCard({ item }: { item: FeedItem }) {
  const [count, setCount] = useState(item.upvotes);
  const [up, setUp] = useState(!!item.viewerUpvoted);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/cases/${item.id}/upvote`, {
        method: "POST",
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d?.error?.message ?? "Couldn't upvote.");
      } else {
        setUp(d.upvoted);
        setCount(d.count);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden border-l-4 transition-all hover:-translate-y-0.5 hover:shadow-elev-2",
        SEV_ACCENT[item.severity] ?? "border-l-border-strong",
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {/* department chip + status */}
        <div className="flex items-start justify-between gap-2">
          <span className="bg-surface-muted text-foreground inline-flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-2.5 text-[11px] font-semibold">
            <span className="bg-brand-soft text-brand grid h-5 w-5 place-items-center rounded-full">
              <CategoryIcon department={item.departmentCode} className="h-3 w-3" />
            </span>
            {humanizeCode(item.departmentCode)}
          </span>
          <StatusBadge status={item.status} />
        </div>

        {/* category + snippet */}
        <Link href={`/cases/${item.id}`} className="flex-1">
          <p className="text-brand text-[11px] font-semibold uppercase tracking-wide">
            {item.categoryName}
          </p>
          <p className="text-foreground/90 group-hover:text-foreground mt-1 line-clamp-3 text-sm leading-relaxed">
            {item.snippet}
          </p>
        </Link>

        {/* meta */}
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <SeverityChip severity={item.severity as Severity} />
          {item.escalated && (
            <span className="text-danger inline-flex items-center gap-1 font-medium">
              <AlertTriangle className="h-3 w-3" /> Escalated
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Ward {item.wardCode}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatRelative(item.createdAt)}
          </span>
        </div>

        {/* engagement */}
        <div className="border-border mt-auto flex items-center justify-between border-t pt-3">
          {item.isOwn ? (
            <span
              className="text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
              title="Your complaint"
            >
              <ThumbsUp className="h-3.5 w-3.5" /> {count}
            </span>
          ) : (
            <button
              type="button"
              onClick={toggle}
              disabled={busy}
              aria-pressed={up}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                up
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-border text-muted-foreground hover:bg-surface-muted hover:text-foreground",
              )}
            >
              <ThumbsUp className={cn("h-3.5 w-3.5", up && "fill-current")} />
              {count}
            </button>
          )}
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            {item.cosigns} backed
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
