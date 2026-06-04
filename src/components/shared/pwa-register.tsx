"use client";

import { useEffect } from "react";

/** Registers the service worker in production (§12.6). */
export function PWARegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline support is best-effort */
      });
    }
  }, []);
  return null;
}
