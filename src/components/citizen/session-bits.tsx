"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useSession } from "@/hooks/use-session";
import { WARDS } from "@/lib/seed-data";
import { initials } from "@/lib/utils";

/*
 * Who is looking, read from the client session rather than the database. The
 * root layout already hands the signed-in user to SessionProvider, so these
 * render instantly on a tab switch — no data promise, no skeleton.
 */

export function FirstName() {
  return <>{useSession()?.name.split(" ")[0] ?? ""}</>;
}

export function FullName() {
  return <>{useSession()?.name ?? ""}</>;
}

export function Initials() {
  const name = useSession()?.name;
  return <>{name ? initials(name) : ""}</>;
}

export function WardName() {
  const code = useSession()?.wardCode ?? "";
  return <>{WARDS.find((w) => w.code === code)?.name ?? code}</>;
}

export function WardCode() {
  return <>{useSession()?.wardCode ?? "—"}</>;
}

export function WardHeatmapLink({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const code = useSession()?.wardCode ?? "";
  return (
    <Link href={`/ward/${code}`} className={className} style={style}>
      {children}
    </Link>
  );
}
