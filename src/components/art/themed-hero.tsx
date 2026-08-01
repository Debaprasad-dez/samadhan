"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// The hero scene is client-only (procedural SVG + DOM motion), loaded per theme.
// SceneHero itself follows the live data-theme attribute, so it reskins on switch.
const SceneHero = dynamic(
  () => import("./scene-hero").then((m) => m.SceneHero),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-[700/290] w-full" />,
  },
);

export function ThemedHero({ className }: { className?: string }) {
  return <SceneHero className={className} />;
}
