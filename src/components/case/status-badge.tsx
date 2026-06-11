"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";
import type { CaseStatus, Severity } from "@/types";

// Class only — the label text comes from the i18n dictionary (status.*),
// so the badge translates with the active language.
const STATUS_META: Record<CaseStatus, { cls: string; dot?: boolean }> = {
  OPEN: { cls: "bg-info-soft text-info" },
  ACKNOWLEDGED: { cls: "bg-info-soft text-info" },
  IN_PROGRESS: { cls: "bg-info-soft text-info", dot: true },
  AWAITING_INFO: { cls: "bg-warning-soft text-warning" },
  RESOLVED: { cls: "bg-success-soft text-success" },
  ESCALATED: { cls: "bg-danger-soft text-danger" },
  CLOSED: { cls: "bg-surface-muted text-muted-foreground" },
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
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
        meta.cls,
        className,
      )}
    >
      {meta.dot && (
        <span className="bg-info h-1.5 w-1.5 animate-pulse-dot rounded-full" />
      )}
      {t(`status.${status}`)}
    </span>
  );
}

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
