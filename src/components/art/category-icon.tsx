import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Custom department icons (design §5.2) with Indian character, drawn at lucide's
// 1.75 stroke weight so they harmonise with the functional icon set.
// currentColor so they inherit the surrounding text colour.
const PATHS: Record<string, ReactNode> = {
  // broom (clean sweep)
  SANITATION: (
    <>
      <path d="M16 3l-7 7" />
      <path d="M5 21c0-4 2-6 4-8l3 3c-2 2-4 4-7 5z" />
      <path d="M12 13l4-4 2 2-4 4z" />
    </>
  ),
  // stepwell / water drop
  WATER: (
    <>
      <path d="M12 3c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z" />
      <path d="M9 21h6M10 18.5h4" />
    </>
  ),
  // lamp / bolt
  ELECTRICITY: (
    <>
      <path d="M13 2L5 13h6l-1 9 8-12h-6z" />
    </>
  ),
  // milestone stone
  ROADS: (
    <>
      <path d="M6 21V8l6-4 6 4v13" />
      <path d="M6 12h12M9 12v9" />
    </>
  ),
  // health (leaf + pulse)
  HEALTH: (
    <>
      <path d="M4 12c4 0 8-4 8-8 4 4 8 4 8 8s-4 8-8 8-8-4-8-8z" />
      <path d="M8 12h2l1.5-3 2 6 1.5-3h2" />
    </>
  ),
  // slate / book (education)
  EDUCATION: (
    <>
      <rect x="4" y="4" width="16" height="14" rx="2" />
      <path d="M8 9h8M8 13h5M10 18v2M14 18v2" />
    </>
  ),
  // shield (police)
  POLICE: (
    <>
      <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" />
      <path d="M9.5 12l2 2 3.5-4" />
    </>
  ),
  // bridge / gear (public works)
  PUBLIC_WORKS: (
    <>
      <path d="M3 16c4 0 5-4 9-4s5 4 9 4" />
      <path d="M3 16v3M21 16v3M9 13v6M15 13v6" />
    </>
  ),
};

export function CategoryIcon({
  department,
  className,
}: {
  department: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
      aria-hidden
    >
      {PATHS[department] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}
