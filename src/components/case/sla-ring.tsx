"use client";

import { useEffect, useState } from "react";
import { slaState } from "@/lib/sla";
import { cn } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";

export function SlaRing({
  createdAt,
  dueAt,
  size = 64,
  className,
}: {
  createdAt: string;
  dueAt: string;
  size?: number;
  className?: string;
}) {
  const t = useT();
  // Compute against client clock after mount to avoid hydration mismatch.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const created = new Date(createdAt).getTime();
  const due = new Date(dueAt).getTime();
  const current = now ?? created;
  const total = due - created;
  const left = due - current;
  const frac = total > 0 ? Math.max(0, Math.min(1, left / total)) : 0;

  const state =
    now === null
      ? "safe"
      : slaState(new Date(createdAt), new Date(dueAt), new Date(now));
  const color =
    state === "breach"
      ? "hsl(var(--danger))"
      : state === "warning"
        ? "hsl(var(--warning))"
        : "hsl(var(--success))";

  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * frac;
  const days = Math.ceil(left / 86_400_000);
  const breached = now !== null && left <= 0;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={breached ? "SLA breached" : `${days} days left in SLA`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          className="transition-all duration-500"
        />
      </svg>
      <span className="font-baloo absolute text-center text-sm font-semibold leading-tight">
        {breached ? t("officer.overdue") : `${Math.max(0, days)}d`}
      </span>
    </div>
  );
}
