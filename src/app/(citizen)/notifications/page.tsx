"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { formatRelative } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { EmptyNotifications } from "@/components/art/empty";

interface Notif {
  id: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function open(n: Notif) {
    if (!n.readAt) {
      await fetch(`/api/notifications/${n.id}/read`, { method: "POST" });
      setItems((prev) =>
        prev.map((x) =>
          x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x,
        ),
      );
    }
    if (n.link) router.push(n.link);
  }

  // Two tiers (spec §3): unread items need you (float to top); read items are
  // just updates.
  const needsYou = items.filter((n) => !n.readAt);
  const updates = items.filter((n) => n.readAt);
  const rowBtn: CSSProperties = {
    width: "100%",
    background: "transparent",
    textAlign: "start",
    cursor: "pointer",
    color: "inherit",
  };

  return (
    <div className="mk space-y-6">
      <h1 className="font-display text-3xl font-semibold">Notifications</h1>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          illustration={<EmptyNotifications />}
          title="All caught up"
          description="No notifications yet. We'll ping you when your cases move."
        />
      ) : (
        <>
          {needsYou.length > 0 && (
            <div className="card" style={{ borderColor: "var(--u-warnline)" }}>
              <div className="ch" style={{ background: "var(--u-warnbg)" }}>
                <b style={{ color: "var(--u-warn)" }}>Needs you</b>
                <span className="m" style={{ color: "var(--u-warn)" }}>
                  {needsYou.length}
                </span>
              </div>
              {needsYou.map((n) => (
                <button key={n.id} onClick={() => open(n)} className="row" style={rowBtn}>
                  <div className="mn">
                    <div className="t1">{n.title}</div>
                    <div className="t2">{n.body}</div>
                  </div>
                  <div className="rt">
                    <span className="pill br">Open</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {updates.length > 0 && (
            <div className="card">
              <div className="ch">
                <b>Updates</b>
                <span className="m">RECENT</span>
              </div>
              {updates.map((n) => (
                <button key={n.id} onClick={() => open(n)} className="row" style={rowBtn}>
                  <div className="mn">
                    <div className="t1">{n.title}</div>
                    <div className="t2">{n.body}</div>
                  </div>
                  <div className="rt">
                    <div className="t2 mono">{formatRelative(n.createdAt)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
