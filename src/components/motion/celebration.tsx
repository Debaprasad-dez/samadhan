"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { ParticleBurst } from "./particle-burst";

// The complaint-filed celebration (design addendum §6.4 — THE delight moment).
// A one-shot full-screen themed particle burst + bloom + a settling checkmark,
// then it removes itself. Reduced-motion → a brief, calm checkmark only.
export function Celebration() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(true);
  const [fire, setFire] = useState(0);

  useEffect(() => {
    setFire(1);
    const t = setTimeout(() => setShow(false), reduced ? 900 : 1300);
    return () => clearTimeout(t);
  }, [reduced]);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] grid place-items-center overflow-hidden"
    >
      {!reduced && (
        <motion.div
          className="absolute h-24 w-24 rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--brand) / .5), transparent 70%)",
          }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 9, opacity: 0 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        />
      )}
      <div className="relative">
        <ParticleBurst fireKey={fire} count={28} spread={120} />
        <motion.div
          className="bg-brand text-brand-foreground shadow-elev-3 grid h-16 w-16 place-items-center rounded-full"
          initial={reduced ? { scale: 1 } : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 15 }}
        >
          <Check className="h-8 w-8" strokeWidth={2.5} />
        </motion.div>
      </div>
    </div>
  );
}
