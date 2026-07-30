import { notFound } from "next/navigation";
import { getWardStats } from "@/lib/ward-stats";
import { WARDS } from "@/lib/seed-data";
import { db } from "@/lib/db";
import { WardGrid } from "@/components/public/ward-grid";
import { Card, CardContent } from "@/components/ui/card";

export default async function WardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!WARDS.some((w) => w.code === code)) notFound();

  const wards = await getWardStats();
  const stat = wards.find((w) => w.code === code);
  if (!stat) notFound();

  const resolved = await db.case.findMany({
    where: {
      wardCode: code,
      assignedToId: { not: null },
      status: { in: ["RESOLVED", "CLOSED"] },
    },
    select: { assignedToId: true },
  });
  const counts = new Map<string, number>();
  for (const c of resolved) {
    const id = c.assignedToId as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const topIds = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const officers = await db.user.findMany({
    where: { id: { in: topIds.map((t) => t[0]) } },
    select: { id: true, name: true },
  });
  const topOfficers = topIds.map(([id, count]) => ({
    name: officers.find((o) => o.id === id)?.name ?? "—",
    count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">
          {stat.name}{" "}
          <span className="text-muted-foreground font-mono text-lg">
            ({stat.code})
          </span>
        </h1>
        <p className="text-muted-foreground text-sm">
          {stat.zone} · ward accountability
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Mumbai wards — deeper teal = higher resolution score. Tap to
            explore.
          </p>
          <WardGrid wards={wards} selected={stat.code} />
        </section>

        <aside className="space-y-4">
          {stat.total === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="font-medium">All quiet here</p>
                <p className="text-muted-foreground text-sm">
                  File the first complaint for this ward.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Complaints" value={String(stat.total)} />
                <Stat label="Resolved" value={String(stat.resolved)} />
                <Stat label="On time" value={`${stat.resolvedOnTimePct}%`} />
              </div>

              <Card>
                <CardContent className="space-y-2 p-4">
                  <p className="text-sm font-semibold">Top categories</p>
                  {stat.topCategories.map((c) => (
                    <div
                      key={c.name}
                      className="text-muted-foreground flex justify-between text-sm"
                    >
                      <span>{c.name}</span>
                      <span>{c.count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-2 p-4">
                  <p className="text-sm font-semibold">Top officers</p>
                  {topOfficers.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No resolutions yet.
                    </p>
                  ) : (
                    topOfficers.map((o) => (
                      <div
                        key={o.name}
                        className="text-muted-foreground flex justify-between text-sm"
                      >
                        <span>{o.name}</span>
                        <span>{o.count} resolved</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-display mt-0.5 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
