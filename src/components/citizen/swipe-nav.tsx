"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

/** The tab order a sideways swipe walks. Filing sits outside it. */
export const TABS = ["/", "/feed", "/cases", "/profile"] as const;

/** Committed travel, and how much of it must be horizontal. */
const DISTANCE = 64;
const DOMINANCE = 1.5;
const DURATION = 700;
/** iOS reserves the left edge for its own back gesture. */
const EDGE = 24;

/** Anything that scrolls sideways, orbits, or sits on its own layer keeps its gesture. */
function ownsGesture(start: EventTarget | null): boolean {
  let el = start instanceof Element ? start : null;
  while (el && el !== document.body) {
    if (el.closest?.(".stage3d, .sheet, input, textarea, select")) return true;
    const styles = getComputedStyle(el);
    if (
      /(auto|scroll)/.test(styles.overflowX) &&
      el.scrollWidth > el.clientWidth + 2
    )
      return true;
    el = el.parentElement;
  }
  return false;
}

/**
 * Sideways swipes walk the tab bar, the way a native app does.
 *
 * Tab moves replace rather than push, so the back gesture unwinds to wherever
 * the session began — Home — instead of retracing every sideways step.
 */
export function SwipeNav() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const index = TABS.indexOf(pathname as (typeof TABS)[number]);
    if (index === -1) return; // detail screens and the wizard sit outside the flow

    // Warm both neighbours so the swipe lands on a rendered page, not a spinner.
    for (const step of [-1, 1]) {
      const near = TABS[index + step];
      if (near) router.prefetch(near);
    }

    let x = 0,
      y = 0,
      at = 0,
      armed = false;

    const down = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        armed = false;
        return;
      }
      const t = e.touches[0];
      armed = t.clientX > EDGE && !ownsGesture(e.target);
      x = t.clientX;
      y = t.clientY;
      at = Date.now();
    };

    const up = (e: TouchEvent) => {
      if (!armed) return;
      armed = false;
      const t = e.changedTouches[0];
      if (!t || Date.now() - at > DURATION) return;

      const dx = t.clientX - x;
      const dy = t.clientY - y;
      if (Math.abs(dx) < DISTANCE || Math.abs(dx) < Math.abs(dy) * DOMINANCE) return;

      const next = index + (dx < 0 ? 1 : -1);
      if (next < 0 || next >= TABS.length) return;

      // A short tick confirms the tab changed under the thumb. Absent on iOS
      // Safari, which exposes no vibration API.
      navigator.vibrate?.(8);

      document.documentElement.dataset.nav = dx < 0 ? "fwd" : "back";
      router.replace(TABS[next]);
    };

    addEventListener("touchstart", down, { passive: true });
    addEventListener("touchend", up, { passive: true });
    return () => {
      removeEventListener("touchstart", down);
      removeEventListener("touchend", up);
    };
  }, [pathname, router]);

  // The direction only styles the arriving page; it must not outlive it.
  useEffect(() => {
    const t = setTimeout(() => delete document.documentElement.dataset.nav, 420);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
