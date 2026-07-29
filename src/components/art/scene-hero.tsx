"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import bharatDawn from "@/assets/heroes/bharat-dawn.png";
import nilgiriMist from "@/assets/heroes/nilgiri-mist.png";

// Per-theme hero background images (src/assets/heroes/<theme>.png), served via
// next/image (auto WebP/AVIF + resize). Light → Bharat Dawn (warm dawn scene);
// dark → Mughal Indigo, which uses the deep-indigo Nilgiri night render. Dormant
// cultural themes reuse the dawn image.
const HERO_IMG: Record<string, StaticImageData> = {
  "bharat-dawn": bharatDawn,
  "mithila-bloom": bharatDawn,
  "warli-earth": bharatDawn,
  "mughal-indigo": nilgiriMist,
  "coromandel-pattachitra": bharatDawn,
  "nilgiri-mist": nilgiriMist,
};

// px the image extends past the hero (= max parallax travel). The matching
// bleed keeps the edges from ever gapping as the image drifts.
const BLEED = 240;

/**
 * Themed hero. Renders the active theme's raw background image (following the
 * live data-theme attribute) with scroll parallax — the image drifts slower than
 * the page — and a soft top/bottom feather that blends it into the page. No
 * zoom, grain, vignette, or tint. Reduced-motion freezes the parallax.
 */
export function SceneHero({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [theme, setTheme] = useState("bharat-dawn");

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

  const img = HERO_IMG[theme] ?? HERO_IMG["bharat-dawn"];

  // Feather the image to transparent at the top and bottom edges so it blends
  // softly into the page background.
  const fade =
    "linear-gradient(to bottom, transparent 0%, #000 16%, #000 80%, transparent 100%)";

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={{ height: 420, WebkitMaskImage: fade, maskImage: fade }}
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
          className="object-cover object-[center_top]"
        />
      </motion.div>
    </div>
  );
}
