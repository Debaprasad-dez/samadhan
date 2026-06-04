import { startOfMonth } from "date-fns";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { humanizeCode } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

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

  const tiles = [
    { label: "Open", value: String(open) },
    { label: "In progress", value: String(inProgress) },
    { label: "Resolved (this month)", value: String(resolvedMonth) },
    { label: "Avg resolution", value: `${avgDays.toFixed(1)}d` },
    { label: "SLA met", value: `${slaMet.toFixed(0)}%` },
    { label: "Avg quality", value: `${qAvg.toFixed(1)}/10` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">My metrics</h1>
        <p className="text-muted-foreground text-sm">
          {user.departmentCode
            ? `${humanizeCode(user.departmentCode)} department`
            : "All departments"}{" "}
          · real-time
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.label}>
            <CardContent className="p-5">
              <p className="text-muted-foreground text-sm">{t.label}</p>
              <p className="font-display mt-1 text-3xl font-semibold">
                {t.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
