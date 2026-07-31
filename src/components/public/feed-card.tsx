"use client";

import { useState } from "react";
import Link from "next/link";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/case/status-badge";
import { cn, humanizeCode } from "@/lib/utils";
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
  isOwn?: boolean;
}

// Mockup feed card: two weighted actions — upvote is a signal, co-sign is
// testimony (a reason + a location) that enters the officer's priority score.
export function FeedCard({ item }: { item: FeedItem }) {
  const [count, setCount] = useState(item.upvotes);
  const [up, setUp] = useState(!!item.viewerUpvoted);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/cases/${item.id}/upvote`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) toast.error(d?.error?.message ?? "Couldn't upvote.");
      else {
        setUp(d.upvoted);
        setCount(d.count);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mk h-full">
      <div className="card" style={{ height: "100%", marginBottom: 0 }}>
        <div className="cb">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <Link
              href={`/cases/${item.id}`}
              style={{ minWidth: 0, flex: 1, color: "inherit", textDecoration: "none" }}
            >
              <div className="t1" style={{ fontSize: "13.5px" }}>
                {item.categoryName}
              </div>
              <div className="t2">
                {humanizeCode(item.departmentCode)} · Ward {item.wardCode}
              </div>
            </Link>
            <StatusBadge status={item.status} />
          </div>

          <p className="t2" style={{ marginTop: 8, lineHeight: 1.5 }}>
            {item.snippet}
          </p>

          <div style={{ display: "flex", gap: 7, marginTop: 11, alignItems: "center" }}>
            {item.isOwn ? (
              <span className="btn s" style={{ padding: "7px 11px", cursor: "default" }}>
                <ThumbsUp />
                {count}
              </span>
            ) : (
              <button
                type="button"
                onClick={toggle}
                disabled={busy}
                aria-pressed={up}
                className={cn("btn", up ? "p" : "s")}
                style={{ padding: "7px 11px" }}
              >
                <ThumbsUp />
                {count}
              </button>
            )}
            <Link className="btn g" href={`/cases/${item.id}`} style={{ padding: "7px 11px" }}>
              Co-sign
            </Link>
            <span
              className="mono"
              style={{ marginLeft: "auto", fontSize: "10.5px", color: "var(--u-faint)" }}
            >
              {item.cosigns} backed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
