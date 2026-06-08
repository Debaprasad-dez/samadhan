"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
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

// px the image extends past the hero (= max parallax travel). Larger → the
// image lags the page more, so the parallax is clearly observable, while the
// matching bleed keeps the edges from ever gapping.
const BLEED = 240;

/**
 * Themed hero. Renders the active theme's background image (following the live
 * data-theme attribute) under cheap CSS overlays that keep it alive: scroll
 * parallax (the image drifts slower than the page), a slow Ken-Burns zoom,
 * time-of-day warmth, film grain, vignette. Top/bottom feather to transparent so
 * it melts into the page. Reduced-motion freezes parallax + drift.
 */
export function SceneHero({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [theme, setTheme] = useState("bharat-dawn");
  const [timeTint, setTimeTint] = useState<string | null>(null);

  // Scroll parallax: translate the image as the hero scrolls through view.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, BLEED]);
  const y = reduced ? 0 : yParallax;

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

  // Feather the whole hero (image + grain + vignette together) to fully
  // transparent at the top and bottom edges, so it melts into the page
  // background with no visible border.
  const fade =
    "linear-gradient(to bottom, transparent 0%, #000 22%, #000 80%, transparent 100%)";

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={{ height: 478, WebkitMaskImage: fade, maskImage: fade }}
    >
      {/* parallax layer — bleeds past the hero on all sides so it never gaps */}
      <motion.div
        className="absolute"
        style={{ y, top: -BLEED, bottom: -BLEED, left: 0, right: 0 }}
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
      </motion.div>

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
    </div>
  );
}
