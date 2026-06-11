"use client";

import Image from "next/image";
import bharatDawn from "@/assets/heroes/bharat-dawn.png";

/**
 * Full-screen login backdrop: the bharat-dawn scene panning right→left in an
 * infinite seamless loop. Two identical copies sit side by side (row = 200vw);
 * the row translates by -50% (= one viewport) so when the second copy reaches
 * the origin it lines up exactly with where the first began — no visible seam.
 * A soft scrim over the top keeps the sign-in card readable. Decorative only;
 * reduced-motion freezes the pan (handled by the global motion-reduce rule).
 */
export function LoginBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
      aria-hidden
    >
      <div className="login-pan flex h-full w-[200%]">
        <div className="relative h-full w-1/2 shrink-0">
          <Image
            src={bharatDawn}
            alt=""
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            className="object-cover object-center"
          />
        </div>
        <div className="relative h-full w-1/2 shrink-0">
          <Image
            src={bharatDawn}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      </div>

      {/* readability scrim — light wash so the form/brand stay legible */}
      <div className="absolute inset-0 bg-background/35" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 48%, color-mix(in srgb, var(--g-bg) 55%, transparent) 0%, transparent 75%)",
        }}
      />
    </div>
  );
}
