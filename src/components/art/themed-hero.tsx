"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { useTheme, type ThemeName } from "@/components/providers/theme-provider";
import { Skeleton } from "@/components/ui/skeleton";

// Per-theme heroes are code-split: only the active theme's chunk loads.
// Each hero is a self-contained procedural SVG component (design handoff §3).
type HeroProps = { className?: string };
const loading = () => <Skeleton className="h-[478px] w-full" />;

const HEROES: Record<ThemeName, ComponentType<HeroProps>> = {
  "bharat-dawn": dynamic(
    () => import("./heroes/bharat-dawn").then((m) => m.HeroBharatDawn),
    { loading, ssr: false },
  ),
  // Other themes: fall back to bharat-dawn until each is ported.
  "mithila-bloom": dynamic(
    () => import("./heroes/bharat-dawn").then((m) => m.HeroBharatDawn),
    { loading, ssr: false },
  ),
  "warli-earth": dynamic(
    () => import("./heroes/bharat-dawn").then((m) => m.HeroBharatDawn),
    { loading, ssr: false },
  ),
  "mughal-indigo": dynamic(
    () => import("./heroes/bharat-dawn").then((m) => m.HeroBharatDawn),
    { loading, ssr: false },
  ),
  "coromandel-pattachitra": dynamic(
    () => import("./heroes/bharat-dawn").then((m) => m.HeroBharatDawn),
    { loading, ssr: false },
  ),
  "nilgiri-mist": dynamic(
    () => import("./heroes/bharat-dawn").then((m) => m.HeroBharatDawn),
    { loading, ssr: false },
  ),
};

export function ThemedHero({ className }: HeroProps) {
  const { theme } = useTheme();
  const Hero = HEROES[theme] ?? HEROES["bharat-dawn"];
  return <Hero className={className} />;
}
