"use client";

import { motion } from "framer-motion";

const COLORS = ["bg-brand", "bg-success", "bg-info", "bg-warning"];

/** One-shot celebration burst (~600ms), §5.1.1 / §7.5. */
export function Confetti() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] flex items-start justify-center overflow-hidden"
      aria-hidden
    >
      {Array.from({ length: 16 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 420;
        const delay = Math.random() * 0.1;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, y: -16, x: 0, rotate: 0 }}
            animate={{ opacity: 0, y: 320, x, rotate: 180 }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className={`absolute top-20 h-2 w-2 rounded-sm ${COLORS[i % COLORS.length]}`}
          />
        );
      })}
    </div>
  );
}
