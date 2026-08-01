"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import bharatDawn from "@/assets/heroes/bharat-dawn.png";
import nilgiriMist from "@/assets/heroes/nilgiri-mist.png";

// Per-theme hero. The two cultural themes get a photographic scene; the flat
// professional/cool themes (Civic Steel, Nilgiri Mist) get a clean themed
// gradient built from their --g-* tokens (null below) so the home hero reskins
// correctly instead of showing a mismatched warm photo.
const HERO_IMG: Record<string, StaticImageData | null> = {
  "bharat-dawn": bharatDawn,
  "mughal-indigo": nilgiriMist, // deep-indigo night render
  "civic-steel": null,
  "nilgiri-mist": null,
  "mithila-bloom": bharatDawn,
  "warli-earth": bharatDawn,
  "coromandel-pattachitra": bharatDawn,
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
export function SceneHero({
  className,
  height = 420,
}: {
  className?: string;
  height?: number;
}) {
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

  const img = theme in HERO_IMG ? HERO_IMG[theme] : bharatDawn;

  // Feather the image to transparent at the top and bottom edges so it blends
  // softly into the page background.
  const fade =
    "linear-gradient(to bottom, transparent 0%, #000 16%, #000 80%, transparent 100%)";

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={{ height, WebkitMaskImage: fade, maskImage: fade }}
    >
      {/* parallax layer — bleeds past the hero on all sides so it never gaps */}
      <motion.div
        className="absolute"
        style={{ y, top: -BLEED, bottom: -BLEED, left: 0, right: 0 }}
      >
        {img ? (
          <Image
            src={img}
            alt=""
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            className="object-cover object-[center_top]"
          />
        ) : (
          // Themed gradient hero for flat themes — reskins via --g-* tokens.
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              background:
                "linear-gradient(140deg,var(--g-stage1),var(--g-stage2) 45%,var(--g-stage3))",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(80% 60% at 18% 4%,color-mix(in srgb,var(--g-primary) 24%,transparent),transparent 68%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(66% 58% at 92% 24%,color-mix(in srgb,var(--g-accent) 20%,transparent),transparent 70%)",
              }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
