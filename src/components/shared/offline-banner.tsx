"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

// Offline state (spec §3 cross-cutting): a fixed banner shown whenever the
// browser goes offline. The PWA shell still serves cached pages; this just tells
// the user why fresh data isn't loading.
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-warning-soft text-warning border-warning/30 fixed inset-x-0 top-0 z-[200] flex items-center justify-center gap-2 border-b px-4 py-1.5 text-xs font-semibold"
    >
      <WifiOff className="h-3.5 w-3.5" aria-hidden />
      You&rsquo;re offline — showing saved data. Changes will sync when
      you&rsquo;re back.
    </div>
  );
}
