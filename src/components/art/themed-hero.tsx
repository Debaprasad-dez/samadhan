"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// The hero scene is client-only (procedural SVG + DOM motion), loaded per theme.
// SceneHero itself follows the live data-theme attribute, so it reskins on switch.
const SceneHero = dynamic(
  () => import("./scene-hero").then((m) => m.SceneHero),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full min-h-[160px] w-full" />,
  },
);

export function ThemedHero({
  className,
  height,
}: {
  className?: string;
  height?: number;
}) {
  return <SceneHero className={className} height={height} />;
}
