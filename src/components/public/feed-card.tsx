"use client";

import { useState } from "react";
import Link from "next/link";
import { ThumbsUp, Users, MapPin } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/case/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, humanizeCode, formatRelative } from "@/lib/utils";
import type { CaseStatus } from "@/types";

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
}

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
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <MapPin className="h-3 w-3" />
            {item.author}
          </span>
          <StatusBadge status={item.status} />
        </div>

        <Link href={`/cases/${item.id}`} className="group flex-1">
          <p className="text-muted-foreground text-[11px] font-medium uppercase">
            {humanizeCode(item.departmentCode)} · {item.categoryName}
          </p>
          <p className="mt-1 line-clamp-3 text-sm group-hover:underline">
            {item.snippet}
          </p>
        </Link>

        <div className="text-muted-foreground flex items-center justify-between border-t pt-2 text-xs">
          <button
            type="button"
            onClick={toggle}
            disabled={busy}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors",
              up ? "bg-brand-soft text-brand" : "hover:bg-surface-muted",
            )}
            aria-pressed={up}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            {count}
          </button>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {item.cosigns}
          </span>
          <span>Ward {item.wardCode}</span>
          <span>{formatRelative(item.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
