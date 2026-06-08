"use client";

import { useEffect, useRef, useState } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { cn } from "@/lib/utils";
import { GradientMesh, Grain } from "@/components/art/atmosphere";
import { useReducedMotion } from "@/lib/motion";

/**
 * LottieScene — the themed home for a Lottie animation (graphics addendum: the
 * art is now premium Lottie, our job is to make it *blend*). It composites the
 * animation over a living gradient-mesh in the theme palette, feathers every edge
 * so it dissolves into the page (no boxed frame), lays film-grain on top, can
 * pull the animation toward the theme hue with a blend mode, and degrades
 * gracefully:
 *   • prefers-reduced-motion → first frame held static (still premium, no motion)
 *   • off-screen → paused (perf on mid-range devices)
 *   • fetch fails / no src → just the themed mesh (never a broken box)
 *
 * `src` is any Lottie JSON URL — a local /public/lottie/*.json or a public
 * LottieFiles / lottie.host link. Swapping art = changing this one string.
 */

const MASK =
  "radial-gradient(128% 140% at 50% 32%, #000 56%, transparent 100%)";

type Props = {
  src: string;
  /** Mesh palette behind the animation. */
  variant?: "dawn" | "ambient";
  /** mix-blend-mode used to fuse the animation with the themed backdrop.
   *  "luminosity" re-hues a colourful Lottie into the theme; undefined = as-authored. */
  blend?: React.CSSProperties["mixBlendMode"];
  /** Optional CSS filter to nudge palette / contrast (e.g. "saturate(.9)"). */
  tint?: string;
  grain?: boolean;
  className?: string;
  /** Accessible description of the scene. */
  label: string;
};

export function LottieScene({
  src,
  variant = "dawn",
  blend,
  tint,
  grain = true,
  className,
  label,
}: Props) {
  const reduced = useReducedMotion() ?? false;
  const [data, setData] = useState<object | null>(null);
  const [failed, setFailed] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  // Fetch the animation client-side (keeps the player out of SSR entirely).
  useEffect(() => {
    let alive = true;
    setData(null);
    setFailed(false);
    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => alive && setData(j))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [src]);

  // Pause when off-screen; never play under reduced motion.
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const a = lottieRef.current;
        if (!a) return;
        if (entry.isIntersecting && !reduced) a.play();
        else a.pause();
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, data]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={label}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: "800 / 380", WebkitMaskImage: MASK, maskImage: MASK }}
    >
      <GradientMesh variant={variant} className="absolute inset-0" />
      {data && !failed && (
        <Lottie
          lottieRef={lottieRef}
          animationData={data}
          loop
          autoplay={!reduced}
          aria-hidden
          className="absolute inset-0 h-full w-full"
          style={{ mixBlendMode: blend, filter: tint }}
          rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
        />
      )}
      {grain && <Grain opacity={0.06} />}
    </div>
  );
}
