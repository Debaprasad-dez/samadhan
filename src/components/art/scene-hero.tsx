"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import bharatDawn from "@/assets/heroes/bharat-dawn.png";

// Per-theme hero background images (src/assets/heroes/<theme>.png), served via
// next/image (auto WebP/AVIF + resize). Static import map — add a theme's import
// here as its PNG is dropped in. For now every theme reuses bharat-dawn.
const HERO_IMG: Record<string, StaticImageData> = {
  "bharat-dawn": bharatDawn,
  "mithila-bloom": bharatDawn,
  "warli-earth": bharatDawn,
  "mughal-indigo": bharatDawn,
  "coromandel-pattachitra": bharatDawn,
  "nilgiri-mist": bharatDawn,
};

/**
 * Themed hero. Renders the active theme's background image (following the live
 * data-theme attribute, so it swaps on theme change) under a set of cheap CSS
 * overlays that keep it alive: a slow Ken-Burns drift, time-of-day warmth, film
 * grain, vignette, and a fade into the page. Reduced-motion freezes the drift.
 */
export function SceneHero({ className }: { className?: string }) {
  const [theme, setTheme] = useState("bharat-dawn");
  const [timeTint, setTimeTint] = useState<string | null>(null);

  // Follow the document's data-theme attribute.
  useEffect(() => {
    const root = document.documentElement;
    const read = () =>
      setTheme(root.getAttribute("data-theme") || "bharat-dawn");
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  // Living detail (design addendum §5.3): warm with the local time of day.
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

  const img = HERO_IMG[theme] ?? HERO_IMG["bharat-dawn"];

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ height: 478 }}
    >
      <Image
        src={img}
        alt=""
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        className="hero-kenburns object-cover object-[center_top]"
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
        aria-hidden
      />

      {/* animated film grain */}
      <div
        className="art-grain pointer-events-none absolute z-[6]"
        style={{
          inset: -40,
          mixBlendMode: "soft-light",
          opacity: 0.4,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          backgroundSize: "170px 170px",
        }}
        aria-hidden
      />

      {/* fade into the page background (per-theme stage colour) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[7]"
        style={{
          height: 120,
          background: "linear-gradient(to bottom, transparent, var(--g-stage1) 94%)",
        }}
        aria-hidden
      />
    </div>
  );
}
