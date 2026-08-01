"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { heroFor } from "@/lib/art/hero-scenes";

/**
 * Themed hero: renders the active theme's procedural, animated SVG scene
 * (Bharat Dawn ghat sunrise, Mughal Indigo jali night, Civic Steel isometric
 * ward, Nilgiri Mist tea terraces). Follows the live data-theme attribute, so it
 * reskins on theme switch. Ambient `an-*` animations live in mockup.css.
 */
export function SceneHero({
  className,
  height = 420,
}: {
  className?: string;
  height?: number;
}) {
  const [theme, setTheme] = useState("bharat-dawn");

  useEffect(() => {
    const root = document.documentElement;
    const read = () =>
      setTheme(root.getAttribute("data-theme") || "bharat-dawn");
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  const svg = useMemo(() => heroFor(theme), [theme]);

  // Soft top/bottom feather so the scene melts into the page.
  const fade =
    "linear-gradient(to bottom, transparent 0%, #000 10%, #000 84%, transparent 100%)";

  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden [&_svg]:block [&_svg]:h-full [&_svg]:w-full",
        className,
      )}
      style={{ height, WebkitMaskImage: fade, maskImage: fade }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
