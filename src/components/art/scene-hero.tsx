"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { heroFor } from "@/lib/art/hero-scenes";

/**
 * Themed hero: renders the active theme's procedural, animated SVG scene at its
 * natural 700×290 aspect (width 100%, height auto) — no crop, no fade — so it
 * reads crisp like the mockup. Follows the live data-theme attribute. Ambient
 * `an-*` animations live in mockup.css.
 */
export function SceneHero({ className }: { className?: string }) {
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

  return (
    <div
      aria-hidden
      className={cn("[&_svg]:block [&_svg]:h-auto [&_svg]:w-full", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
