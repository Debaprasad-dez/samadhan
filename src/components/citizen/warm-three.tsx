"use client";

import { useEffect } from "react";

/**
 * The ward explorer's 3D block needs three.js, a large chunk fetched on demand.
 * Fetch it quietly while the reader is still on the feed — the only way into
 * the explorer — so its ghost block can draw the moment they tap through,
 * instead of leaving an empty sky while the chunk downloads.
 */
export function WarmThree() {
  useEffect(() => {
    const warm = () => void import("three");
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(warm, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 1500);
    return () => clearTimeout(id);
  }, []);

  return null;
}
