"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production (§12.6).
 *
 * In development it does the opposite: it unregisters any service worker and
 * clears its caches. A SW registered by an earlier `pnpm start` (or by another
 * app sharing localhost) keeps intercepting the dev server on the same origin
 * and serves stale `/_next/` chunks, which surfaces as
 * "Cannot read properties of undefined (reading 'call')" in a lazy chunk.
 */
export function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline support is best-effort */
      });
      return;
    }

    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .then(() => caches?.keys())
      .then((keys) => Promise.all((keys ?? []).map((k) => caches.delete(k))))
      .catch(() => {
        /* nothing to clean up */
      });
  }, []);
  return null;
}
