import { cn } from "@/lib/utils";
import type { CaseStatus, Severity } from "@/types";

const STATUS_META: Record<
  CaseStatus,
  { label: string; cls: string; dot?: boolean }
> = {
  OPEN: { label: "Open", cls: "bg-info-soft text-info" },
  ACKNOWLEDGED: { label: "Acknowledged", cls: "bg-info-soft text-info" },
  IN_PROGRESS: { label: "In progress", cls: "bg-info-soft text-info", dot: true },
  AWAITING_INFO: { label: "Awaiting info", cls: "bg-warning-soft text-warning" },
  RESOLVED: { label: "Resolved", cls: "bg-success-soft text-success" },
  ESCALATED: { label: "Escalated", cls: "bg-danger-soft text-danger" },
  CLOSED: { label: "Closed", cls: "bg-surface-muted text-muted-foreground" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: CaseStatus;
  className?: string;
}) {
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
      {meta.label}
    </span>
  );
}

const SEVERITY_META: Record<Severity, { label: string; cls: string }> = {
  LOW: { label: "Low", cls: "bg-surface-muted text-muted-foreground" },
  MEDIUM: { label: "Medium", cls: "bg-warning-soft text-warning" },
  HIGH: { label: "High", cls: "bg-danger-soft text-danger" },
};

export function SeverityChip({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const meta = SEVERITY_META[severity] ?? SEVERITY_META.MEDIUM;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium",
        meta.cls,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
