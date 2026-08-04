"use client";

import { useEffect } from "react";

/**
 * Scroll choreography for the home page (mockup): reveals each `.reveal` block
 * as it enters view, fills the SLA/standing bars from their data-w, and pops the
 * heat cells in. Runs once per element.
 */
export function HomeReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".chome .reveal"));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.style.animationDelay = `${(Number(el.dataset.d) || 0) * 0.09}s`;
          el.classList.add("in");
          el.querySelectorAll<HTMLElement>(".trk i").forEach((bar, i) =>
            setTimeout(() => {
              bar.style.width = `${bar.dataset.w}%`;
            }, 240 + i * 130),
          );
          el.querySelectorAll(".heat i").forEach((c) => c.classList.add("in"));
          io.unobserve(el);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
