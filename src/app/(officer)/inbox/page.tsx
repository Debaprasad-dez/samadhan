"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Keyboard,
  Loader2,
  AlertTriangle,
  Check,
  PlayCircle,
  ChevronRight,
  MapPin,
  Users,
  Clock,
} from "lucide-react";
import { useInbox, useCaseEvent, type InboxItem } from "@/hooks/use-officer";
import { StatusBadge, SeverityChip } from "@/components/case/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { EmptyInbox } from "@/components/art/empty";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatRelative } from "@/lib/utils";
import type { CaseStatus } from "@/types";

const STATUS_FILTERS = [
  { k: "open", l: "Open" },
  { k: "all", l: "All" },
  { k: "ACKNOWLEDGED", l: "Acknowledged" },
  { k: "IN_PROGRESS", l: "In progress" },
  { k: "ESCALATED", l: "Escalated" },
];

const SHORTCUTS = [
  ["J / ↓", "Next"],
  ["K / ↑", "Previous"],
  ["Enter / C", "Open case"],
  ["A", "Acknowledge"],
  ["I", "Move to in progress"],
  ["/", "Focus filter"],
  ["?", "This help"],
];

// Severity → left accent colour, so urgency is readable at a glance.
const SEV_ACCENT: Record<string, string> = {
  HIGH: "border-l-danger",
  MEDIUM: "border-l-warning",
  LOW: "border-l-info",
};

// The single obvious next step for a worker, given the case status.
function nextAction(status: string): { next: CaseStatus; label: string } | null {
  if (status === "OPEN") return { next: "ACKNOWLEDGED", label: "Acknowledge" };
  if (status === "ACKNOWLEDGED")
    return { next: "IN_PROGRESS", label: "Start work" };
  return null;
}

export default function OfficerInbox() {
  const router = useRouter();
  const [status, setStatus] = useState("open");
  const [severity, setSeverity] = useState("");
  const { data, isLoading, isError, refetch } = useInbox({ status, severity });
  const event = useCaseEvent();

  const cases: InboxItem[] = data?.cases ?? [];
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [helpOpen, setHelpOpen] = useState(false);
  const filterRef = useRef<HTMLInputElement>(null);

  // Keep the cursor in range when the filtered list shrinks.
  useEffect(() => {
    setCursor((c) => Math.min(c, Math.max(0, cases.length - 1)));
  }, [cases.length]);

  function act(c: InboxItem | undefined, next: CaseStatus, label: string) {
    if (!c) return;
    event.mutate(
      { id: c.id, status: next },
      {
        onSuccess: () => toast.success(`${c.number}: ${label}`),
        onError: (e) => toast.error(e.message),
      },
    );
  }

  // Keyboard shortcuts (§5.5.1).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        return;
      }
      if (e.key === "?") {
        setHelpOpen(true);
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        filterRef.current?.focus();
        return;
      }
      if (!cases.length) return;
      const k = e.key.toLowerCase();
      if (e.key === "ArrowDown" || k === "j") {
        e.preventDefault();
        setCursor((c) => Math.min(cases.length - 1, c + 1));
      } else if (e.key === "ArrowUp" || k === "k") {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      } else if (e.key === "Enter" || k === "c") {
        router.push(`/case/${cases[cursor]?.id}`);
      } else if (k === "a") {
        act(cases[cursor], "ACKNOWLEDGED", "Acknowledged");
      } else if (k === "i") {
        act(cases[cursor], "IN_PROGRESS", "In progress");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases, cursor]);

  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else if (next.size < 20) next.add(id);
      else toast.info("You can select up to 20.");
      return next;
    });
  }

  async function bulkAck() {
    const ids = [...selected];
    for (const id of ids) {
      await event.mutateAsync({ id, status: "ACKNOWLEDGED" }).catch(() => null);
    }
    toast.success(`Acknowledged ${ids.length} case(s).`);
    setSelected(new Set());
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Inbox</h1>
          <p className="text-muted-foreground text-sm">
            Prioritised queue · {data?.total ?? 0} cases
          </p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Keyboard shortcuts" onClick={() => setHelpOpen(true)}>
          <Keyboard />
        </Button>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={filterRef}
          value={severity}
          onChange={(e) => setSeverity(e.target.value.toUpperCase())}
          placeholder="Filter severity (LOW / MEDIUM / HIGH)"
          className="border-border-strong bg-surface h-9 w-full rounded-md border px-3 text-sm shadow-sm sm:w-72"
        />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.k}
            onClick={() => setStatus(f.k)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              status === f.k
                ? "border-brand bg-brand-soft text-brand"
                : "text-muted-foreground hover:bg-surface-muted",
            )}
          >
            {f.l}
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="bg-brand-soft flex items-center justify-between rounded-md p-2 text-sm">
          <span>{selected.size} selected</span>
          <Button size="sm" onClick={bulkAck} disabled={event.isPending}>
            Acknowledge selected
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-muted-foreground">Couldn&rsquo;t load the inbox.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : cases.length === 0 ? (
        <EmptyState
          illustration={<EmptyInbox />}
          title="Inbox zero"
          description="No open cases in your queue. Beautifully clear."
        />
      ) : (
        <div className="space-y-2.5">
          {cases.map((c, i) => {
            const overdue = new Date(c.slaDueAt).getTime() < Date.now();
            const action = nextAction(c.status);
            const active = i === cursor;
            return (
              <Card
                key={c.id}
                className={cn(
                  "border-l-4 transition-shadow",
                  SEV_ACCENT[c.severity] ?? "border-l-border-strong",
                  active ? "ring-brand/60 shadow-elev-2 ring-2" : "hover:shadow-elev-1",
                )}
              >
                <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
                  {/* select + priority rank */}
                  <div className="flex items-center gap-3 sm:flex-col sm:gap-1.5">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleSelect(c.id)}
                      className="h-4 w-4"
                      aria-label={`Select ${c.number}`}
                    />
                    <span
                      title="Priority rank"
                      className="bg-surface-muted text-muted-foreground grid h-7 min-w-[28px] place-items-center rounded-md px-1.5 font-mono text-xs font-semibold"
                    >
                      #{c.rank}
                    </span>
                  </div>

                  {/* title + meta (tap to open) */}
                  <button
                    type="button"
                    onClick={() => router.push(`/case/${c.id}`)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate font-semibold">{c.title}</p>
                    <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="font-mono">{c.number}</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Ward {c.wardCode}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" /> {c._count.cosigns}
                      </span>
                    </div>
                  </button>

                  {/* status / severity / SLA */}
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityChip severity={c.severity} />
                    <StatusBadge status={c.status} />
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        overdue
                          ? "bg-danger/10 text-danger"
                          : "bg-surface-muted text-muted-foreground",
                      )}
                    >
                      {overdue ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {overdue ? "Overdue" : `Due ${formatRelative(c.slaDueAt)}`}
                    </span>
                  </div>

                  {/* one obvious action + open */}
                  <div className="flex items-center gap-2 sm:ml-auto">
                    {action && (
                      <Button
                        size="sm"
                        onClick={() => act(c, action.next, action.label)}
                        disabled={event.isPending}
                      >
                        {action.next === "ACKNOWLEDGED" ? (
                          <Check />
                        ) : (
                          <PlayCircle />
                        )}
                        {action.label}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/case/${c.id}`)}
                    >
                      Open
                      <ChevronRight />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {event.isPending && (
        <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
          <Loader2 className="h-3 w-3 animate-spin" /> updating…
        </p>
      )}

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
          </DialogHeader>
          <ul className="space-y-1.5 text-sm">
            {SHORTCUTS.map(([k, d]) => (
              <li key={k} className="flex items-center justify-between">
                <span className="text-muted-foreground">{d}</span>
                <kbd className="bg-surface-muted rounded px-1.5 py-0.5 font-mono text-xs">
                  {k}
                </kbd>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
