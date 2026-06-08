"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const GRAIN_URL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>";

export function HeroBharatDawn({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const hero = heroRef.current;
    if (!svg || !hero) return;

    let cleanup: (() => void) | undefined;
    import("@/lib/art/bharat").then(({ buildBharatScene, setupBharatMotion }) => {
      buildBharatScene(svg);
      cleanup = setupBharatMotion(svg, hero, null);
    });

    return () => cleanup?.();
  }, []);

  return (
    <div
      ref={heroRef}
      className={cn("relative overflow-hidden", className)}
      style={{ height: 478 }}
    >
      {/* procedural SVG scene — filled by buildBharatScene in useEffect */}
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden
      />

      {/* cinematic vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "radial-gradient(130% 90% at 50% 28%, transparent 55%, rgba(40,22,8,.16) 100%)",
        }}
      />

      {/* animated film grain */}
      <div
        className="art-grain pointer-events-none absolute z-[6]"
        style={{
          inset: -40,
          mixBlendMode: "soft-light",
          opacity: 0.42,
          backgroundImage: `url("${GRAIN_URL}")`,
          backgroundSize: "170px 170px",
        }}
      />

      {/* bottom fade into page background */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[7]"
        style={{
          height: 120,
          background:
            "linear-gradient(to bottom, transparent, hsl(var(--bg)) 92%)",
        }}
      />
    </div>
  );
}
