"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { setupMotion } from "@/lib/art/core";

// Map app theme → handoff scene key (the original procedural SVG scenes in
// public/art/art-<key>.js, ported verbatim from the design handoff).
const SCENE_KEY: Record<string, string> = {
  "bharat-dawn": "bharat",
  "mithila-bloom": "mithila",
  "warli-earth": "warli",
  "mughal-indigo": "mughal",
  "coromandel-pattachitra": "pattachitra",
  "nilgiri-mist": "pichwai",
};

type SamadhanGlobal = {
  scenes: Record<string, (svg: SVGSVGElement) => void>;
};
declare global {
  interface Window {
    SAMADHAN?: SamadhanGlobal;
  }
}

const GRAIN_URL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>";

// Load an external script once; cache the promise so repeat themes reuse it.
const scriptCache = new Map<string, Promise<void>>();
function loadScript(src: string): Promise<void> {
  let p = scriptCache.get(src);
  if (p) return p;
  p = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(s);
  });
  scriptCache.set(src, p);
  return p;
}

/**
 * The themed hero scene. Reads the live `data-theme` attribute (so it follows
 * both the ThemeProvider and any manual data-theme change) and renders that
 * tradition's procedural SVG scene with parallax + ambient motion. Each scene is
 * the verbatim handoff art, loaded on demand. Motion is cancellable, so cycling
 * themes doesn't leak rAF loops.
 */
export function SceneHero({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState("bharat-dawn");
  const [timeTint, setTimeTint] = useState<string | null>(null);

  // Living detail (design addendum §5.3): the hero warms with the local time of
  // day — gold at dawn, warm at dusk, cool at night, neutral midday.
  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 8)
      setTimeTint("linear-gradient(180deg, hsl(38 92% 60% / .14), transparent 62%)");
    else if (h >= 17 && h < 20)
      setTimeTint("linear-gradient(0deg, hsl(18 88% 52% / .18), transparent 58%)");
    else if (h >= 20 || h < 5)
      setTimeTint("linear-gradient(180deg, hsl(224 55% 18% / .26), hsl(224 50% 10% / .14))");
    else setTimeTint(null);
  }, []);

  // Follow the document's data-theme attribute.
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.getAttribute("data-theme") || "bharat-dawn");
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  // (Re)build the scene whenever the theme changes.
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const key = SCENE_KEY[theme] ?? "bharat";

    (async () => {
      await loadScript("/art/art-core.js");
      await loadScript(`/art/art-${key}.js`);
      if (cancelled) return;
      const S = window.SAMADHAN;
      const svg = svgRef.current;
      const hero = heroRef.current;
      if (!S || !svg || !hero) return;
      (S.scenes[key] ?? S.scenes.bharat)(svg);
      cleanup = setupMotion(svg, hero, null);
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [theme]);

  return (
    <div
      ref={heroRef}
      className={cn("relative overflow-hidden", className)}
      style={{ height: 478 }}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden
      />

      {/* time-of-day warmth */}
      {timeTint && (
        <div
          className="pointer-events-none absolute inset-0 z-[4]"
          style={{ background: timeTint, mixBlendMode: "soft-light" }}
          aria-hidden
        />
      )}

      {/* cinematic vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "radial-gradient(130% 90% at 50% 28%, transparent 55%, rgba(20,12,6,.18) 100%)",
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

      {/* fade into the page background (per-theme stage colour) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[7]"
        style={{
          height: 120,
          background: "linear-gradient(to bottom, transparent, var(--g-stage1) 94%)",
        }}
      />
    </div>
  );
}
