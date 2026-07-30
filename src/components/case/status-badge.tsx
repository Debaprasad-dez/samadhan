"use client";

import {
  Circle,
  Check,
  Clock,
  MessageSquare,
  CheckCircle2,
  CheckCheck,
  ArrowUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";
import type { CaseStatus, Severity } from "@/types";

// Invariant 2 (design spec §0): status is NEVER colour alone — always icon +
// label + colour. The label text comes from the i18n dictionary (status.*), so
// the pill translates with the active language.
const STATUS_META: Record<CaseStatus, { cls: string; icon: LucideIcon }> = {
  OPEN: { cls: "bg-surface-muted text-muted-foreground", icon: Circle },
  ACKNOWLEDGED: { cls: "bg-info-soft text-info", icon: Check },
  IN_PROGRESS: { cls: "bg-warning-soft text-warning", icon: Clock },
  AWAITING_INFO: { cls: "bg-warning-soft text-warning", icon: MessageSquare },
  RESOLVED: { cls: "bg-success-soft text-success", icon: CheckCircle2 },
  ESCALATED: { cls: "bg-danger-soft text-danger", icon: ArrowUp },
  CLOSED: { cls: "bg-surface-muted text-muted-foreground", icon: CheckCheck },
};

export function StatusBadge({
  status,
  className,
}: {
  status: CaseStatus;
  className?: string;
}) {
  const t = useT();
  const meta = STATUS_META[status] ?? STATUS_META.OPEN;
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
        meta.cls,
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {t(`status.${status}`)}
    </span>
  );
}

// The design spec names this primitive "StatusPill"; StatusBadge is the same
// component (icon + label + colour). Alias so either name works.
export const StatusPill = StatusBadge;

const SEVERITY_META: Record<Severity, { cls: string }> = {
  LOW: { cls: "bg-surface-muted text-muted-foreground" },
  MEDIUM: { cls: "bg-warning-soft text-warning" },
  HIGH: { cls: "bg-danger-soft text-danger" },
};

export function SeverityChip({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const t = useT();
  const meta = SEVERITY_META[severity] ?? SEVERITY_META.MEDIUM;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium",
        meta.cls,
        className,
      )}
    >
      {t(`severity.${severity}`)}
    </span>
  );
}
