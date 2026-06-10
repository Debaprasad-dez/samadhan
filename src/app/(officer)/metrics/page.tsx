import { startOfMonth } from "date-fns";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Target,
  Star,
  type LucideIcon,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { humanizeCode, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCard {
  label: string;
  value: string;
  icon: LucideIcon;
  color: "text-danger" | "text-warning" | "text-info" | "text-success";
  bgColor: "bg-danger/10" | "bg-warning/10" | "bg-info/10" | "bg-success/10";
  subtitle?: string;
}

export default async function OfficerMetrics() {
  const user = await requireRole(["OFFICER"]);
  const base = user.departmentCode
    ? { departmentCode: user.departmentCode }
    : {};
  const monthStart = startOfMonth(new Date());

  const [open, inProgress, resolvedMonth, resolved] = await Promise.all([
    db.case.count({
      where: {
        ...base,
        status: { in: ["OPEN", "ACKNOWLEDGED", "AWAITING_INFO", "ESCALATED"] },
      },
    }),
    db.case.count({ where: { ...base, status: "IN_PROGRESS" } }),
    db.case.count({
      where: {
        ...base,
        status: { in: ["RESOLVED", "CLOSED"] },
        resolvedAt: { gte: monthStart },
      },
    }),
    db.case.findMany({
      where: {
        ...base,
        status: { in: ["RESOLVED", "CLOSED"] },
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
        slaDueAt: true,
        qualityScore: true,
      },
    }),
  ]);

  const n = resolved.length;
  const avgDays =
    n === 0
      ? 0
      : resolved.reduce((a, c) => {
          const r = c.resolvedAt ?? c.createdAt;
          return a + (r.getTime() - c.createdAt.getTime()) / 86_400_000;
        }, 0) / n;
  const slaMet =
    n === 0
      ? 0
      : (resolved.filter((c) => (c.resolvedAt ?? c.createdAt) <= c.slaDueAt)
          .length /
          n) *
        100;
  const qScores = resolved.filter((c) => c.qualityScore != null);
  const qAvg =
    qScores.length === 0
      ? 0
      : qScores.reduce((a, c) => a + (c.qualityScore ?? 0), 0) / qScores.length;

  const queueMetrics: MetricCard[] = [
    {
      label: "Open",
      value: String(open),
      icon: AlertCircle,
      color: "text-danger",
      bgColor: "bg-danger/10",
      subtitle: "Awaiting action",
    },
    {
      label: "In progress",
      value: String(inProgress),
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
      subtitle: "Currently working",
    },
  ];

  const performanceMetrics: MetricCard[] = [
    {
      label: "Resolved this month",
      value: String(resolvedMonth),
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Avg resolution",
      value: `${avgDays.toFixed(1)}d`,
      icon: TrendingUp,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  const qualityMetrics: MetricCard[] = [
    {
      label: "SLA met",
      value: `${slaMet.toFixed(0)}%`,
      icon: Target,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Avg quality",
      value: `${qAvg.toFixed(1)}/10`,
      icon: Star,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">My metrics</h1>
        <p className="text-muted-foreground text-sm">
          {user.departmentCode
            ? `${humanizeCode(user.departmentCode)} department`
            : "All departments"}{" "}
          · real-time
        </p>
      </div>

      {/* Queue Status */}
      <MetricsGroup title="Queue status" metrics={queueMetrics} />

      {/* Performance */}
      <MetricsGroup title="Performance" metrics={performanceMetrics} />

      {/* Quality */}
      <MetricsGroup title="Quality" metrics={qualityMetrics} />
    </div>
  );
}

function MetricsGroup({
  title,
  metrics,
}: {
  title: string;
  metrics: MetricCard[];
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="overflow-hidden transition-shadow hover:shadow-elev-1">
              <CardContent className="flex items-start gap-3 p-4">
                {/* icon badge */}
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
                    m.bgColor,
                  )}
                >
                  <Icon className={cn("h-5 w-5", m.color)} />
                </span>

                {/* label + value + subtitle */}
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {m.label}
                  </p>
                  <p className="font-display mt-0.5 text-2xl font-bold">
                    {m.value}
                  </p>
                  {m.subtitle && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {m.subtitle}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
