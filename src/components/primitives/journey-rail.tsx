"use client";

import {
  FilePlus2,
  Eye,
  ArrowRightCircle,
  MessageSquare,
  Image as ImageIcon,
  HelpCircle,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  CheckCheck,
  Users,
  Circle,
  Check,
  type LucideIcon,
} from "lucide-react";
import { formatRelative, formatIST, cn } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";
import type { EventType, CaseStatus } from "@/types";

// JourneyRail (design spec §2.3) — the signature component. Three variants:
//  - "timeline": vertical rail with node dots, stage-duration chips, one LIVE
//    node, and a ghosted/dashed future node (pending confirmation, escalation).
//  - "stepper": horizontal 6-stage progress, for rows and previews.
//  - "map": only meaningful when crewPing data exists; falls back to stepper.
// Exactly one node may be `live` at a time.

const ICON: Record<EventType, LucideIcon> = {
  CREATED: FilePlus2,
  ACKNOWLEDGED: Eye,
  STATUS_CHANGED: ArrowRightCircle,
  COMMENT_ADDED: MessageSquare,
  EVIDENCE_ADDED: ImageIcon,
  INFO_REQUESTED: HelpCircle,
  INFO_PROVIDED: MessageSquare,
  RESOLVED: CheckCircle2,
  REOPENED: RotateCcw,
  ESCALATED: AlertTriangle,
  CLOSED: CheckCheck,
  REASSIGNED: Users,
};

export interface JourneyEvent {
  id: string;
  type: string;
  message?: string | null;
  createdAt: string;
  actor?: { name: string; role: string } | null;
  /** e.g. "21 min", "2d 5h" — how long this stage took. */
  durationLabel?: string;
  /** The single in-progress node (spec: exactly one). */
  live?: boolean;
  /** A not-yet-happened node: dashed rung + ghosted styling. */
  future?: boolean;
}

// Six-stage pipeline for the stepper (spec §2.3).
const STAGES: CaseStatus[] = [
  "OPEN",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "AWAITING_INFO",
  "RESOLVED",
  "CLOSED",
];

function stageIndex(status: CaseStatus): number {
  if (status === "ESCALATED") return STAGES.indexOf("IN_PROGRESS");
  const i = STAGES.indexOf(status);
  return i === -1 ? 0 : i;
}

export function JourneyRail({
  variant = "timeline",
  events,
  status,
  hasCrewPing = false,
  className,
}: {
  variant?: "timeline" | "stepper" | "map";
  events?: JourneyEvent[];
  status?: CaseStatus;
  hasCrewPing?: boolean;
  className?: string;
}) {
  // Map only renders with real crew-ping data; otherwise show the stepper.
  const resolved = variant === "map" && !hasCrewPing ? "stepper" : variant;

  if (resolved === "stepper" && status) {
    return <Stepper status={status} className={className} />;
  }
  return <Timeline events={events ?? []} className={className} />;
}

function Timeline({
  events,
  className,
}: {
  events: JourneyEvent[];
  className?: string;
}) {
  const t = useT();
  return (
    <ol className={cn("relative", className)}>
      {events.map((e, i) => {
        const Icon = ICON[e.type as EventType] ?? Circle;
        const last = i === events.length - 1;
        return (
          <li key={e.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!last && (
              <span
                className={cn(
                  "absolute bottom-0 left-[15px] top-8 w-px",
                  e.future ? "border-border border-l border-dashed" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                e.live
                  ? "bg-brand text-brand-foreground ring-brand/30 ring-4"
                  : e.future
                    ? "border-border text-muted-foreground border border-dashed bg-transparent"
                    : "bg-surface-muted text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className={cn("min-w-0 pt-1", e.future && "opacity-60")}>
              <p className="flex items-center gap-2 text-sm font-medium">
                {ICON[e.type as EventType] ? t(`timeline.${e.type}`) : e.type}
                {e.durationLabel && (
                  <span className="bg-surface-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                    {e.durationLabel}
                  </span>
                )}
              </p>
              {e.message && (
                <p className="text-muted-foreground text-sm">{e.message}</p>
              )}
              <p className="text-muted-foreground mt-0.5 text-xs">
                <span title={formatIST(e.createdAt)}>
                  {e.future ? formatIST(e.createdAt) : formatRelative(e.createdAt)}
                </span>
                {e.actor?.name ? ` · ${e.actor.name}` : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Stepper({
  status,
  className,
}: {
  status: CaseStatus;
  className?: string;
}) {
  const t = useT();
  const current = stageIndex(status);
  const escalated = status === "ESCALATED";
  return (
    <ol className={cn("flex items-start", className)}>
      {STAGES.map((s, i) => {
        const done = i < current;
        const live = i === current;
        const isLast = i === STAGES.length - 1;
        return (
          <li key={s} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "h-px flex-1",
                  i === 0 ? "opacity-0" : done || live ? "bg-brand" : "bg-border",
                )}
              />
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px]",
                  done
                    ? "bg-brand text-brand-foreground"
                    : live
                      ? escalated
                        ? "bg-danger text-white ring-danger/30 ring-4"
                        : "bg-brand text-brand-foreground ring-brand/30 ring-4"
                      : "bg-surface-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "h-px flex-1",
                  isLast ? "opacity-0" : done ? "bg-brand" : "bg-border",
                )}
              />
            </div>
            <span
              className={cn(
                "mt-1 text-center text-[10px] font-medium leading-tight",
                live ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {t(`status.${s}`)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
