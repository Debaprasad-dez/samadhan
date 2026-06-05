"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { useTheme, type ThemeName } from "@/components/providers/theme-provider";
import { Skeleton } from "@/components/ui/skeleton";

// Per-theme heroes are code-split (design §10.1): only the active theme's hero
// chunk is fetched, keeping the art bundle lean.
type HeroProps = { className?: string };
const loading = () => <Skeleton className="aspect-[2/1] w-full rounded-lg" />;

const HEROES: Record<ThemeName, ComponentType<HeroProps>> = {
  "bharat-dawn": dynamic(
    () => import("./heroes/bharat-dawn").then((m) => m.HeroBharatDawn),
    { loading },
  ),
  "mithila-bloom": dynamic(
    () => import("./heroes/mithila-bloom").then((m) => m.HeroMithilaBloom),
    { loading },
  ),
  "warli-earth": dynamic(
    () => import("./heroes/warli-earth").then((m) => m.HeroWarliEarth),
    { loading },
  ),
  "mughal-indigo": dynamic(
    () => import("./heroes/mughal-indigo").then((m) => m.HeroMughalIndigo),
    { loading },
  ),
  "coromandel-pattachitra": dynamic(
    () =>
      import("./heroes/coromandel-pattachitra").then(
        (m) => m.HeroCoromandelPattachitra,
      ),
    { loading },
  ),
  "nilgiri-mist": dynamic(
    () => import("./heroes/nilgiri-mist").then((m) => m.HeroNilgiriMist),
    { loading },
  ),
};

export function ThemedHero({ className }: HeroProps) {
  const { theme } = useTheme();
  const Hero = HEROES[theme] ?? HEROES["bharat-dawn"];
  return <Hero className={className} />;
}
