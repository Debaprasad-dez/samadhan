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
  type LucideIcon,
} from "lucide-react";
import { formatRelative, formatIST } from "@/lib/utils";
import type { EventType } from "@/types";

export interface TimelineEvent {
  id: string;
  type: string;
  message: string | null;
  createdAt: string;
  actor?: { name: string; role: string } | null;
}

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

const LABEL: Record<EventType, string> = {
  CREATED: "Complaint filed",
  ACKNOWLEDGED: "Acknowledged",
  STATUS_CHANGED: "Status changed",
  COMMENT_ADDED: "Comment added",
  EVIDENCE_ADDED: "Evidence added",
  INFO_REQUESTED: "Information requested",
  INFO_PROVIDED: "Information provided",
  RESOLVED: "Resolved",
  REOPENED: "Reopened",
  ESCALATED: "Escalated",
  CLOSED: "Closed",
  REASSIGNED: "Reassigned",
};

export function CaseTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative">
      {events.map((e, i) => {
        const Icon = ICON[e.type as EventType] ?? Circle;
        const last = i === events.length - 1;
        return (
          <li key={e.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!last && (
              <span className="bg-border absolute bottom-0 left-[15px] top-8 w-px" />
            )}
            <span className="bg-surface-muted text-muted-foreground z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-sm font-medium">
                {LABEL[e.type as EventType] ?? e.type}
              </p>
              {e.message && (
                <p className="text-muted-foreground text-sm">{e.message}</p>
              )}
              <p className="text-muted-foreground mt-0.5 text-xs">
                <span title={formatIST(e.createdAt)}>
                  {formatRelative(e.createdAt)}
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
