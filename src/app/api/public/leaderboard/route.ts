import { subDays } from "date-fns";
import { db } from "@/lib/db";
import { ok } from "@/lib/api";
import { WARDS } from "@/lib/seed-data";
import { tierForScore } from "@/lib/reputation";
import { initials, humanizeCode } from "@/lib/utils";

export interface LeaderRow {
  rank: number;
  label: string;
  sublabel: string;
  score: string;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "citizens";
  const period = url.searchParams.get("period") === "7d" ? 7 : 30;
  const since = subDays(new Date(), period);

  let rows: LeaderRow[] = [];

  if (type === "wards") {
    const cases = await db.case.findMany({
      where: { resolvedAt: { gte: since } },
      select: { wardCode: true, resolvedAt: true, slaDueAt: true },
    });
    const byWard = WARDS.map((w) => {
      const ward = cases.filter((c) => c.wardCode === w.code);
      const onTime = ward.filter((c) => c.resolvedAt && c.resolvedAt <= c.slaDueAt).length;
      const pct = ward.length === 0 ? 0 : (onTime / ward.length) * 100;
      return { name: w.name, code: w.code, resolved: ward.length, pct };
    })
      .filter((w) => w.resolved > 0)
      .sort((a, b) => b.pct - a.pct || a.name.localeCompare(b.name))
      .slice(0, 10);
    rows = byWard.map((w, i) => ({
      rank: i + 1,
      label: `${w.name} (${w.code})`,
      sublabel: `${w.resolved} resolved`,
      score: `${Math.round(w.pct)}% on time`,
    }));
  } else if (type === "officers") {
    const cases = await db.case.findMany({
      where: {
        assignedToId: { not: null },
        status: { in: ["RESOLVED", "CLOSED"] },
        resolvedAt: { gte: since },
      },
      select: { assignedToId: true, createdAt: true, resolvedAt: true },
    });
    const agg = new Map<string, { count: number; days: number }>();
    for (const c of cases) {
      const id = c.assignedToId as string;
      const r = c.resolvedAt ?? c.createdAt;
      const days = (r.getTime() - c.createdAt.getTime()) / 86_400_000;
      const cur = agg.get(id) ?? { count: 0, days: 0 };
      agg.set(id, { count: cur.count + 1, days: cur.days + days });
    }
    const officers = await db.user.findMany({
      where: { id: { in: [...agg.keys()] } },
      select: { id: true, name: true, departmentCode: true },
    });
    rows = officers
      .map((o) => {
        const a = agg.get(o.id)!;
        return {
          name: o.name,
          dept: o.departmentCode ?? "",
          count: a.count,
          avg: a.days / a.count,
        };
      })
      .sort((a, b) => a.avg - b.avg || b.count - a.count)
      .slice(0, 10)
      .map((o, i) => ({
        rank: i + 1,
        label: o.name,
        sublabel: humanizeCode(o.dept),
        score: `${o.avg.toFixed(1)}d avg · ${o.count} resolved`,
      }));
  } else {
    const citizens = await db.user.findMany({
      where: { role: "CITIZEN" },
      orderBy: { reputation: "desc" },
      take: 10,
      select: { name: true, reputation: true, showOnLeaderboard: true },
    });
    rows = citizens.map((c, i) => ({
      rank: i + 1,
      label: c.showOnLeaderboard ? c.name : initials(c.name),
      sublabel: tierForScore(c.reputation),
      score: `${c.reputation} pts`,
    }));
  }

  return ok({ rows });
}
