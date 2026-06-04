import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { humanizeCode, formatRelative } from "@/lib/utils";
import { StatusBadge } from "@/components/case/status-badge";
import { PrintButton } from "@/components/admin/print-button";
import { Card, CardContent } from "@/components/ui/card";
import type { CaseStatus } from "@/types";

export default async function OfficerDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { id } = await params;

  const officer = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, role: true, departmentCode: true, wardCode: true },
  });
  if (!officer || officer.role !== "OFFICER") notFound();

  const cases = await db.case.findMany({
    where: { assignedToId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      number: true,
      title: true,
      status: true,
      createdAt: true,
      resolvedAt: true,
      qualityScore: true,
    },
  });

  const resolved = cases.filter(
    (c) => c.status === "RESOLVED" || c.status === "CLOSED",
  );
  const avgDays =
    resolved.length === 0
      ? 0
      : resolved.reduce((a, c) => {
          const r = c.resolvedAt ?? c.createdAt;
          return a + (r.getTime() - c.createdAt.getTime()) / 86_400_000;
        }, 0) / resolved.length;
  const q = resolved.filter((c) => c.qualityScore != null);
  const qAvg =
    q.length === 0 ? 0 : q.reduce((a, c) => a + (c.qualityScore ?? 0), 0) / q.length;

  const tiles = [
    { label: "Total cases", value: String(cases.length) },
    {
      label: "Resolved %",
      value: cases.length ? `${Math.round((resolved.length / cases.length) * 100)}%` : "—",
    },
    { label: "Avg resolution", value: `${avgDays.toFixed(1)}d` },
    { label: "Avg quality", value: q.length ? `${qAvg.toFixed(1)}/10` : "—" },
  ];

  return (
    <div className="space-y-6">
      <Link href="/officers" className="text-muted-foreground hover:text-foreground text-sm">
        ← Officers
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{officer.name}</h1>
          <p className="text-muted-foreground text-sm">
            {humanizeCode(officer.departmentCode ?? "")} · Ward {officer.wardCode}
          </p>
        </div>
        <PrintButton label="Publish quarterly report" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label}>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-xs">{t.label}</p>
              <p className="font-display mt-1 text-2xl font-semibold">{t.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold">Case history</h2>
        <div className="overflow-hidden rounded-lg border">
          {cases.length === 0 ? (
            <p className="text-muted-foreground p-6 text-center text-sm">
              No cases assigned.
            </p>
          ) : (
            cases.map((c) => (
              <Link
                key={c.id}
                href={`/case/${c.id}`}
                className="hover:bg-surface-muted flex items-center gap-3 border-b px-4 py-2.5 text-sm last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.title}</p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {c.number} · {formatRelative(c.createdAt)}
                  </p>
                </div>
                {c.qualityScore !== null && (
                  <span className="text-muted-foreground text-xs">
                    {c.qualityScore}/10
                  </span>
                )}
                <StatusBadge status={c.status as CaseStatus} />
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
