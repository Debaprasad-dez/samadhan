"use client";

import { useEffect, useState } from "react";
import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";

/**
 * Shared motion primitives (graphics addendum §2.3). Spring-first: interactive
 * and reveal motion uses physics, never linear tweens. Everything here is
 * reduced-motion and capability aware so Tier-S euphoria never costs Tier-B speed.
 */

/** Spring presets. `gentle` is the house default from the addendum. */
export const springs = {
  gentle: { stiffness: 120, damping: 18, mass: 1 },
  soft: { stiffness: 90, damping: 20, mass: 1 },
  snappy: { stiffness: 320, damping: 30, mass: 0.8 },
  slow: { stiffness: 55, damping: 16, mass: 1.2 },
} as const;

export { useReducedMotion };

/**
 * True only on devices with a fine, hovering pointer and adequate memory. Gates
 * the heavier pointer-parallax / cinematic effects so mid-range touch devices
 * over 4G skip them and keep the static-lit composition. SSR-safe (false until
 * mounted, so the server render and first paint stay calm).
 */
export function useCanHover(): boolean {
  const [can, setCan] = useState(false);
  useEffect(() => {
    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const mem = (navigator as Navigator & { deviceMemory?: number })
      .deviceMemory;
    const lowMem = typeof mem === "number" && mem > 0 && mem < 4;
    setCan(fine && !lowMem);
  }, []);
  return can;
}

/**
 * Pointer-parallax driver. Returns two spring-smoothed motion values in roughly
 * [-1, 1] (pointer position across the viewport, centre = 0). Multiply by a
 * per-layer depth in the consumer to fan layers apart. No-ops (eased back to 0)
 * while `disabled`, and rAF-throttled so it never floods the main thread.
 */
export function usePointerParallax(disabled = false): {
  x: MotionValue<number>;
  y: MotionValue<number>;
} {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, springs.gentle);
  const sy = useSpring(y, springs.gentle);

  useEffect(() => {
    if (disabled) {
      x.set(0);
      y.set(0);
      return;
    }
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        x.set((e.clientX / window.innerWidth - 0.5) * 2);
        y.set((e.clientY / window.innerHeight - 0.5) * 2);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [disabled, x, y]);

  return { x: sx, y: sy };
}
