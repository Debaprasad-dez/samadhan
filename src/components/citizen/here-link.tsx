"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** A link to the page you are on — usable in a loading shell, which gets no params. */
export function HereLink({
  className,
  label,
  children,
}: {
  className?: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link href={usePathname()} className={className} aria-label={label}>
      {children}
    </Link>
  );
}
