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
import { getDict, translate } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCard {
  label: string;
  value: string;
  icon: LucideIcon;
  color: "text-danger" | "text-warning" | "text-info" | "text-success";
  bgColor:
    | "bg-danger-soft"
    | "bg-warning-soft"
    | "bg-info-soft"
    | "bg-success-soft";
  subtitle?: string;
}

export default async function OfficerMetrics() {
  const user = await requireRole(["OFFICER"]);
  const dict = getDict(user.language);
  const t = (k: string) => translate(dict, k);
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
      label: t("status.OPEN"),
      value: String(open),
      icon: AlertCircle,
      color: "text-danger",
      bgColor: "bg-danger-soft",
      subtitle: t("officer.awaitingAction"),
    },
    {
      label: t("status.IN_PROGRESS"),
      value: String(inProgress),
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning-soft",
      subtitle: t("officer.currentlyWorking"),
    },
  ];

  const performanceMetrics: MetricCard[] = [
    {
      label: t("officer.resolvedThisMonth"),
      value: String(resolvedMonth),
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success-soft",
    },
    {
      label: t("officer.avgResolution"),
      value: `${avgDays.toFixed(1)}d`,
      icon: TrendingUp,
      color: "text-info",
      bgColor: "bg-info-soft",
    },
  ];

  const qualityMetrics: MetricCard[] = [
    {
      label: t("officer.slaMet"),
      value: `${slaMet.toFixed(0)}%`,
      icon: Target,
      color: "text-success",
      bgColor: "bg-success-soft",
    },
    {
      label: t("officer.avgQuality"),
      value: `${qAvg.toFixed(1)}/10`,
      icon: Star,
      color: "text-warning",
      bgColor: "bg-warning-soft",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">
          {t("officer.metrics")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {user.departmentCode
            ? `${humanizeCode(user.departmentCode)} ${t("officer.department")}`
            : t("officer.allDepartments")}{" "}
          · {t("officer.realtime")}
        </p>
      </div>

      {/* Queue Status */}
      <MetricsGroup title={t("officer.queueStatus")} metrics={queueMetrics} />

      {/* Performance */}
      <MetricsGroup title={t("officer.performance")} metrics={performanceMetrics} />

      {/* Quality */}
      <MetricsGroup title={t("officer.quality")} metrics={qualityMetrics} />
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
