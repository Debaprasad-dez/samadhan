import { db } from "@/lib/db";
import { WARDS, CATEGORIES } from "@/lib/seed-data";

const catName = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? "—";

export interface WardStat {
  code: string;
  name: string;
  zone: string;
  total: number;
  resolved: number;
  resolvedOnTimePct: number;
  score: number; // 0-100 composite
  topCategories: { name: string; count: number }[];
}

export async function getWardStats(): Promise<WardStat[]> {
  const cases = await db.case.findMany({
    select: {
      wardCode: true,
      status: true,
      categoryId: true,
      resolvedAt: true,
      slaDueAt: true,
    },
  });

  return WARDS.map((w) => {
    const ward = cases.filter((c) => c.wardCode === w.code);
    const total = ward.length;
    const resolvedCases = ward.filter(
      (c) => c.status === "RESOLVED" || c.status === "CLOSED",
    );
    const resolved = resolvedCases.length;
    const onTime = resolvedCases.filter(
      (c) => c.resolvedAt && c.resolvedAt <= c.slaDueAt,
    ).length;
    const resolvedOnTimePct = resolved === 0 ? 0 : (onTime / resolved) * 100;
    const resolutionRate = total === 0 ? 0 : resolved / total;
    const score = Math.round(
      resolvedOnTimePct * 0.6 + resolutionRate * 100 * 0.4,
    );

    const counts = new Map<string, number>();
    for (const c of ward)
      counts.set(c.categoryId, (counts.get(c.categoryId) ?? 0) + 1);
    const topCategories = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, count]) => ({ name: catName(id), count }));

    return {
      code: w.code,
      name: w.name,
      zone: w.zone,
      total,
      resolved,
      resolvedOnTimePct: Math.round(resolvedOnTimePct),
      score,
      topCategories,
    };
  });
}
