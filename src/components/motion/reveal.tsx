"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Children, type ReactNode } from "react";

// Page-load choreography primitive (design addendum §6.3): a spring slide-up +
// fade, staggerable via `delay`. Content is interactive immediately; the motion
// is purely decorative. Reduced-motion → renders statically (no transform).
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 90, damping: 18 }}
    >
      {children}
    </motion.div>
  );
}

// Staggered reveal of a container's direct children (design addendum §6.3) — the
// page-load cascade. Each child rises + fades in turn. Reduced-motion → static.
export function RevealList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  const items = Children.toArray(children);
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}
    >
      {items.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: {
              opacity: 1,
              y: 0,
              transition: { type: "spring", stiffness: 90, damping: 18 },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
