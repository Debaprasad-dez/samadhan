"use client";

import { useEffect, useRef } from "react";
import { island } from "@/lib/art/ward-island";
import { plinth } from "@/lib/art/plinth";
import { limitYard } from "@/lib/art/limit-yard";
import { radiusMap } from "@/lib/art/radius-map";
import { sortBench } from "@/lib/art/sort-bench";
import { journeyRoad } from "@/lib/art/journey-road";

export type GhostKind = "island" | "plinth" | "yard" | "radius" | "bench" | "road";

/** Each scene's canvas height; every scene is 430 wide. */
const HEIGHT: Record<GhostKind, number> = {
  island: 310,
  plinth: 310,
  yard: 306,
  radius: 306,
  bench: 300,
  road: 306,
};

/** Long enough for each scene's build-in to finish before the next begins. */
const CYCLE_MS = 2600;

const rand = Math.random;
const int = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));

/*
 * Made-up inputs for the page's own illustration. Nothing here is allowed to
 * look like an alarm — no column through the charter ceiling, no overdue pin —
 * because a loading state must never be mistaken for a real escalation, even
 * drawn faintly.
 */
const SCENES: Record<GhostKind, () => string> = {
  island: () => island(int(10, 95)),
  plinth: () => plinth({ fixes: int(0, 9), tier: int(10, 95), active: int(0, 4) }),
  yard: () =>
    limitYard(Array.from({ length: int(3, 6) }, (_, i) => ({ id: "·".repeat(i + 1), frac: 0.15 + rand() * 0.72 }))),
  radius: () =>
    radiusMap(
      Array.from({ length: int(3, 6) }, (_, i) => ({
        id: "·".repeat(i + 1),
        r: 0.2 + rand() * 0.75,
        t: rand() * Math.PI * 2 - Math.PI,
        co: int(0, 12),
        st: rand() < 0.5 ? "ok" : "warn",
      })),
    ),
  bench: () => sortBench(int(1, 4), int(3, 10)),
  road: () => {
    const limitH = 24 * int(3, 10);
    const labels = ["FILED", "ACK", "ASSIGNED", "UPDATE"];
    let h = 0;
    const stages = Array.from({ length: int(2, 4) }, (_, i) => {
      if (i > 0) h += limitH * (0.08 + rand() * 0.2);
      return { h, label: labels[i] };
    });
    return journeyRoad(stages, Math.min(limitH * 0.88, h + limitH * (0.05 + rand() * 0.18)), limitH, "LIMIT", "NOW");
  },
};

/**
 * The page's own illustration, drawn faint and rebuilt with made-up values on
 * a loop until the real data arrives. It reads as the scene assembling itself
 * rather than as a grey box — and as plainly not yet real.
 *
 * Painted only on the client, so the server markup is just the sky at the
 * scene's exact aspect ratio and the real hero lands in the same box.
 */
export function GhostHero({ kind }: { kind: GhostKind }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const paint = () => {
      host.querySelector("svg")?.remove();
      host.insertAdjacentHTML("afterbegin", SCENES[kind]());
    };
    paint();

    const mo = new MutationObserver(paint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Reduced motion: one still frame, no looping rebuild.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = still ? undefined : window.setInterval(paint, CYCLE_MS);

    return () => {
      mo.disconnect();
      if (timer) window.clearInterval(timer);
    };
  }, [kind]);

  return (
    <div
      className="hero ph ghost"
      ref={ref}
      style={{ aspectRatio: `430 / ${HEIGHT[kind]}` }}
      role="img"
      aria-label="Loading"
      aria-busy
    >
      <div className="fade" />
    </div>
  );
}
