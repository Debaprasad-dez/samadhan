"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatRelative, cn } from "@/lib/utils";
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

  return (
    <div className="space-y-6">
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
        <div className="overflow-hidden rounded-lg border">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => open(n)}
              className={cn(
                "hover:bg-surface-muted flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-0",
                !n.readAt && "bg-brand-soft/40",
              )}
            >
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  n.readAt ? "bg-transparent" : "bg-brand",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-muted-foreground truncate text-sm">
                  {n.body}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {formatRelative(n.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
