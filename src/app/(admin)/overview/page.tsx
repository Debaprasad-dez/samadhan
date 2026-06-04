import { requireRole } from "@/lib/auth";
import { getOverview } from "@/lib/admin-stats";
import { VolumeChart, DeptBarChart } from "@/components/admin/charts";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminOverview() {
  await requireRole(["ADMIN"]);
  const o = await getOverview(30);

  const kpis = [
    { label: "Open", value: String(o.kpis.open) },
    { label: "In progress", value: String(o.kpis.inProgress) },
    { label: "Resolved", value: String(o.kpis.resolved) },
    { label: "Avg resolution", value: `${o.kpis.avgResolutionDays}d` },
    { label: "SLA met", value: `${o.kpis.slaMetPct}%` },
    { label: "Reopen rate", value: `${o.kpis.reopenRate}%` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Overview</h1>
        <p className="text-muted-foreground text-sm">
          City-wide accountability · last 30 days
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-xs">{k.label}</p>
              <p className="font-display mt-1 text-2xl font-semibold">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="mb-2 text-sm font-semibold">Complaint volume (30 days)</p>
          <VolumeChart data={o.volumeByDay} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="mb-2 text-sm font-semibold">By department</p>
            <DeptBarChart data={o.byDepartment} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-2 p-5">
              <p className="text-sm font-semibold">Top wards by volume</p>
              {o.topWardsByVolume.map((w) => (
                <div key={w.ward} className="text-muted-foreground flex justify-between text-sm">
                  <span>{w.ward}</span>
                  <span>{w.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-5">
              <p className="text-sm font-semibold">Fastest-resolving wards</p>
              {o.topWardsBySpeed.map((w) => (
                <div key={w.ward} className="text-muted-foreground flex justify-between text-sm">
                  <span>{w.ward}</span>
                  <span>{w.avgDays}d</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-2 p-5">
          <p className="text-sm font-semibold">Recent escalations</p>
          {o.recentEscalations.length === 0 ? (
            <p className="text-muted-foreground text-sm">None.</p>
          ) : (
            o.recentEscalations.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">{e.title}</span>
                <span className="text-muted-foreground font-mono text-xs">
                  {e.number} · {e.ward}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
