"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  AlertTriangle,
  AlertCircle,
  ArrowDownCircle,
  ChevronRight,
  MoreVertical,
  MapPin,
  Users,
  Clock,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { useInbox, useCaseEvent, type InboxItem } from "@/hooks/use-officer";
import { StatusBadge, SeverityChip } from "@/components/case/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { EmptyInbox } from "@/components/art/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn, humanizeCode, formatRelative } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";
import type { CaseStatus } from "@/types";

// k = filter value sent to the API; labelKey = i18n key for the chip text.
const STATUS_FILTERS = [
  { k: "open", labelKey: "status.OPEN" },
  { k: "all", labelKey: "common.all" },
  { k: "ACKNOWLEDGED", labelKey: "status.ACKNOWLEDGED" },
  { k: "IN_PROGRESS", labelKey: "status.IN_PROGRESS" },
  { k: "ESCALATED", labelKey: "status.ESCALATED" },
];

// Statuses an officer can move a case to, from the card.
const STATUS_OPTIONS: CaseStatus[] = [
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "AWAITING_INFO",
  "ESCALATED",
  "RESOLVED",
];

// Severity → an icon + colour for the leading badge (urgency at a glance).
const SEVERITY: Record<
  string,
  { Icon: LucideIcon; color: string; bg: string }
> = {
  HIGH: { Icon: AlertTriangle, color: "text-danger", bg: "bg-danger-soft" },
  MEDIUM: { Icon: AlertCircle, color: "text-warning", bg: "bg-warning-soft" },
  LOW: { Icon: ArrowDownCircle, color: "text-info", bg: "bg-info-soft" },
};

export default function OfficerInbox() {
  const router = useRouter();
  const t = useT();
  const [status, setStatus] = useState("open");
  const [severity, setSeverity] = useState("");
  const { data, isLoading, isError, refetch } = useInbox({ status, severity });
  const event = useCaseEvent();

  const cases = useMemo<InboxItem[]>(() => data?.cases ?? [], [data]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Keep selection valid as the list changes.
  useEffect(() => {
    setSelected((s) => {
      const ids = new Set(cases.map((c) => c.id));
      const next = new Set([...s].filter((id) => ids.has(id)));
      return next.size === s.size ? s : next;
    });
  }, [cases]);

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
      <div>
        <h1 className="font-display text-3xl font-semibold">
          {t("officer.inbox")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("officer.inboxSub")} · {data?.total ?? 0} {t("officer.casesCount")}
        </p>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={severity}
          onChange={(e) => setSeverity(e.target.value.toUpperCase())}
          placeholder={t("officer.filterSeverity")}
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
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="bg-brand-soft flex items-center justify-between rounded-md p-2 text-sm">
          <span>
            {selected.size} {t("officer.selected")}
          </span>
          <Button size="sm" onClick={bulkAck} disabled={event.isPending}>
            {t("officer.acknowledgeSelected")}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-muted-foreground">{t("officer.loadError")}</p>
            <Button variant="outline" onClick={() => refetch()}>
              {t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      ) : cases.length === 0 ? (
        <EmptyState
          illustration={<EmptyInbox />}
          title={t("officer.inboxZero")}
          description={t("officer.inboxZeroSub")}
        />
      ) : (
        <div className="space-y-2.5">
          {cases.map((c) => {
            const overdue = new Date(c.slaDueAt).getTime() < Date.now();
            const sev = SEVERITY[c.severity] ?? SEVERITY.MEDIUM;
            const SevIcon = sev.Icon;
            return (
              <Card key={c.id} className="transition-shadow hover:shadow-elev-1">
                <CardContent className="flex items-start gap-3 p-4 sm:gap-4">
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleSelect(c.id)}
                    className="accent-brand mt-1 h-5 w-5 shrink-0 rounded"
                    aria-label={`Select ${c.number}`}
                  />

                  {/* severity icon */}
                  <span
                    title={`${humanizeCode(c.severity)} severity`}
                    className={cn(
                      "mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full",
                      sev.bg,
                    )}
                  >
                    <SevIcon className={cn("h-5 w-5", sev.color)} />
                  </span>

                  {/* body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      {/* title + number + meta (tap to open) */}
                      <button
                        type="button"
                        onClick={() => router.push(`/case/${c.id}`)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-base font-bold sm:text-lg">
                          {c.title}
                        </p>
                        <p className="text-muted-foreground font-mono text-sm">
                          {c.number}
                        </p>
                        <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-sm">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {c.wardCode}
                          </span>
                          <span className="text-border-strong">|</span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {c._count.cosigns}
                          </span>
                          <span className="text-border-strong">|</span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1",
                              overdue && "text-danger font-medium",
                            )}
                          >
                            {overdue ? (
                              <>
                                <AlertTriangle className="h-3.5 w-3.5" />{" "}
                                {t("officer.overdue")}
                              </>
                            ) : (
                              <>
                                <Clock className="h-3.5 w-3.5" />{" "}
                                {formatRelative(c.slaDueAt)}
                              </>
                            )}
                          </span>
                        </p>
                      </button>

                      {/* severity + status pills + more menu */}
                      <div className="flex shrink-0 items-center gap-2">
                        <SeverityChip severity={c.severity} />
                        <span className="hidden sm:inline-flex">
                          <StatusBadge status={c.status} />
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label="More actions"
                            >
                              <MoreVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/case/${c.id}`)}
                            >
                              <ExternalLink className="h-4 w-4" />
                              {t("officer.openCase")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>
                              {t("officer.setStatus")}
                            </DropdownMenuLabel>
                            {STATUS_OPTIONS.map((s) => (
                              <DropdownMenuItem
                                key={s}
                                disabled={c.status === s}
                                onClick={() => act(c, s, t(`status.${s}`))}
                              >
                                {t(`status.${s}`)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* bottom controls */}
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Select
                        value={STATUS_OPTIONS.includes(c.status) ? c.status : ""}
                        onValueChange={(v) => act(c, v as CaseStatus, t(`status.${v}`))}
                      >
                        <SelectTrigger
                          className="h-9 w-[150px]"
                          aria-label={t("officer.setStatus")}
                        >
                          <SelectValue placeholder={t("officer.setStatus")} />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {t(`status.${s}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="secondary"
                        onClick={() => router.push(`/case/${c.id}`)}
                        aria-label={`${t("common.open")} ${c.number}`}
                      >
                        {t("common.open")}
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {event.isPending && (
        <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
          <Loader2 className="h-3 w-3 animate-spin" /> {t("officer.updating")}
        </p>
      )}
    </div>
  );
}
