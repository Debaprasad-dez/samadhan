"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { useTheme } from "@/components/providers/theme-provider";

// Per-theme particle burst (design addendum §6.4): marigold petals / lotus /
// gold sparkle / etc., themed by the active tradition. Fires whenever `fireKey`
// changes (pass an incrementing number). Decorative; disabled under reduced
// motion. Renders absolutely centred in its (relative) parent.
type Shape = "petal" | "dot" | "leaf";
const THEME_PARTICLES: Record<string, { colors: string[]; shape: Shape }> = {
  "bharat-dawn": { colors: ["--g-primary", "--g-gold", "--g-accent"], shape: "petal" },
  "mithila-bloom": { colors: ["--g-primary", "--g-accent", "--g-gold"], shape: "petal" },
  "warli-earth": { colors: ["--g-ink", "--g-primary", "--g-gold"], shape: "dot" },
  "mughal-indigo": { colors: ["--g-gold", "--g-gold-lt", "--g-accent"], shape: "dot" },
  "coromandel-pattachitra": { colors: ["--g-primary", "--g-gold", "--g-accent"], shape: "petal" },
  "nilgiri-mist": { colors: ["--g-accent", "--g-gold", "--g-primary"], shape: "leaf" },
};

const RADIUS: Record<Shape, string> = {
  petal: "50% 50% 50% 50% / 64% 64% 40% 40%",
  dot: "50%",
  leaf: "0 60% 0 60%",
};

export function ParticleBurst({
  fireKey,
  count = 18,
  spread = 80,
}: {
  fireKey: number;
  count?: number;
  spread?: number;
}) {
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  const cfg = THEME_PARTICLES[theme] ?? THEME_PARTICLES["bharat-dawn"];

  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = Math.random() * Math.PI * 2;
        const d = spread * (0.45 + Math.random() * 0.7);
        return {
          id: i,
          x: Math.cos(a) * d,
          y: Math.sin(a) * d - spread * 0.35, // bias upward
          rot: (Math.random() * 2 - 1) * 200,
          color: cfg.colors[i % cfg.colors.length],
          sc: 0.55 + Math.random() * 0.8,
          dur: 0.6 + Math.random() * 0.45,
          w: 7 + Math.random() * 5,
        };
      }),
    // regenerate each burst
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fireKey, count, spread],
  );

  if (reduced || fireKey === 0) return null;

  return (
    <div
      key={fireKey}
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 z-50"
    >
      {parts.map((p) => (
        <motion.span
          key={p.id}
          className="absolute block"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, scale: p.sc, opacity: 0, rotate: p.rot }}
          transition={{ duration: p.dur, ease: "easeOut" }}
          style={{
            width: p.w,
            height: cfg.shape === "petal" ? p.w * 1.5 : p.w,
            borderRadius: RADIUS[cfg.shape],
            background: `var(${p.color})`,
          }}
        />
      ))}
    </div>
  );
}
