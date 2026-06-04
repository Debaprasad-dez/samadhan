"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setUnread(d.unread ?? 0))
      .catch(() => undefined);
  }, []);

  return (
    <Link
      href="/notifications"
      aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      className="text-muted-foreground hover:text-foreground hover:bg-surface-muted relative flex h-9 w-9 items-center justify-center rounded-md"
    >
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="bg-brand text-brand-foreground absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
