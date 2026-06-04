import { subDays, format } from "date-fns";
import { db } from "@/lib/db";
import { WARDS, CATEGORIES } from "@/lib/seed-data";

const OPEN_STATES = ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "AWAITING_INFO", "ESCALATED"];
const wardName = (code: string) => WARDS.find((w) => w.code === code)?.name ?? code;
const catName = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? "—";

export interface Overview {
  kpis: {
    open: number;
    inProgress: number;
    resolved: number;
    avgResolutionDays: number;
    slaMetPct: number;
    reopenRate: number;
  };
  volumeByDay: { date: string; count: number }[];
  byDepartment: { department: string; count: number }[];
  topWardsByVolume: { ward: string; count: number }[];
  topWardsBySpeed: { ward: string; avgDays: number }[];
  recentEscalations: {
    id: string;
    number: string;
    title: string;
    ward: string;
  }[];
}

export async function getOverview(periodDays = 30): Promise<Overview> {
  const now = new Date();
  const since = subDays(now, periodDays);

  const cases = await db.case.findMany({
    select: {
      id: true,
      number: true,
      title: true,
      status: true,
      departmentCode: true,
      wardCode: true,
      createdAt: true,
      resolvedAt: true,
      slaDueAt: true,
      reopenedAt: true,
      escalated: true,
    },
  });

  const open = cases.filter((c) => OPEN_STATES.includes(c.status) && c.status !== "IN_PROGRESS").length;
  const inProgress = cases.filter((c) => c.status === "IN_PROGRESS").length;
  const resolvedCases = cases.filter(
    (c) => c.status === "RESOLVED" || c.status === "CLOSED",
  );
  const resolved = resolvedCases.length;

  const avgResolutionDays =
    resolved === 0
      ? 0
      : resolvedCases.reduce((a, c) => {
          const r = c.resolvedAt ?? c.createdAt;
          return a + (r.getTime() - c.createdAt.getTime()) / 86_400_000;
        }, 0) / resolved;

  const slaMet = resolvedCases.filter(
    (c) => (c.resolvedAt ?? c.createdAt) <= c.slaDueAt,
  ).length;
  const slaMetPct = resolved === 0 ? 0 : (slaMet / resolved) * 100;
  const reopenRate =
    resolved === 0
      ? 0
      : (cases.filter((c) => c.reopenedAt).length / resolved) * 100;

  // volume by day over the window
  const buckets = new Map<string, number>();
  for (let i = periodDays - 1; i >= 0; i--) {
    buckets.set(format(subDays(now, i), "MMM d"), 0);
  }
  for (const c of cases) {
    if (c.createdAt >= since) {
      const key = format(c.createdAt, "MMM d");
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }
  const volumeByDay = [...buckets.entries()].map(([date, count]) => ({ date, count }));

  // by department
  const dept = new Map<string, number>();
  for (const c of cases) dept.set(c.departmentCode, (dept.get(c.departmentCode) ?? 0) + 1);
  const byDepartment = [...dept.entries()]
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count);

  // wards
  const wardVol = new Map<string, number>();
  const wardSpeed = new Map<string, { days: number; n: number }>();
  for (const c of cases) {
    wardVol.set(c.wardCode, (wardVol.get(c.wardCode) ?? 0) + 1);
    if (c.resolvedAt) {
      const d = (c.resolvedAt.getTime() - c.createdAt.getTime()) / 86_400_000;
      const cur = wardSpeed.get(c.wardCode) ?? { days: 0, n: 0 };
      wardSpeed.set(c.wardCode, { days: cur.days + d, n: cur.n + 1 });
    }
  }
  const topWardsByVolume = [...wardVol.entries()]
    .map(([code, count]) => ({ ward: `${wardName(code)} (${code})`, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const topWardsBySpeed = [...wardSpeed.entries()]
    .map(([code, v]) => ({ ward: `${wardName(code)} (${code})`, avgDays: Number((v.days / v.n).toFixed(1)) }))
    .sort((a, b) => a.avgDays - b.avgDays)
    .slice(0, 5);

  const recentEscalations = cases
    .filter((c) => c.escalated)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((c) => ({ id: c.id, number: c.number, title: c.title, ward: c.wardCode }));

  return {
    kpis: {
      open,
      inProgress,
      resolved,
      avgResolutionDays: Number(avgResolutionDays.toFixed(1)),
      slaMetPct: Math.round(slaMetPct),
      reopenRate: Number(reopenRate.toFixed(1)),
    },
    volumeByDay,
    byDepartment,
    topWardsByVolume,
    topWardsBySpeed,
    recentEscalations,
  };
}

export interface OfficerRow {
  id: string;
  name: string;
  department: string;
  ward: string;
  total: number;
  resolvedPct: number;
  avgDays: number;
  qualityAvg: number;
  rank: number;
}

export async function getOfficerRows(): Promise<OfficerRow[]> {
  const [officers, cases] = await Promise.all([
    db.user.findMany({
      where: { role: "OFFICER" },
      select: { id: true, name: true, departmentCode: true, wardCode: true },
    }),
    db.case.findMany({
      where: { assignedToId: { not: null } },
      select: {
        assignedToId: true,
        status: true,
        createdAt: true,
        resolvedAt: true,
        qualityScore: true,
      },
    }),
  ]);

  const rows = officers.map((o) => {
    const mine = cases.filter((c) => c.assignedToId === o.id);
    const resolved = mine.filter(
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
    const qualityAvg =
      q.length === 0 ? 0 : q.reduce((a, c) => a + (c.qualityScore ?? 0), 0) / q.length;
    return {
      id: o.id,
      name: o.name,
      department: o.departmentCode ?? "—",
      ward: o.wardCode ?? "—",
      total: mine.length,
      resolvedPct: mine.length === 0 ? 0 : Math.round((resolved.length / mine.length) * 100),
      avgDays: Number(avgDays.toFixed(1)),
      qualityAvg: Number(qualityAvg.toFixed(1)),
      rank: 0,
    };
  });

  rows.sort((a, b) => b.resolvedPct - a.resolvedPct || a.avgDays - b.avgDays);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

export interface Cluster {
  categoryId: string;
  title: string;
  count: number;
  wards: string[];
  sample: { number: string; title: string };
}

export async function getClusters(periodDays = 14): Promise<Cluster[]> {
  const since = subDays(new Date(), periodDays);
  const cases = await db.case.findMany({
    where: { createdAt: { gte: since } },
    select: { number: true, title: true, categoryId: true, wardCode: true },
  });

  const groups = new Map<string, typeof cases>();
  for (const c of cases) {
    const arr = groups.get(c.categoryId) ?? [];
    arr.push(c);
    groups.set(c.categoryId, arr);
  }

  return [...groups.entries()]
    .filter(([, arr]) => arr.length >= 3)
    .map(([categoryId, arr]) => ({
      categoryId,
      title: catName(categoryId),
      count: arr.length,
      wards: [...new Set(arr.map((c) => c.wardCode))],
      sample: { number: arr[0].number, title: arr[0].title },
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export interface Hotspot {
  ward: string;
  total: number;
  breachRate: number;
}

export interface TrendInputs {
  clusters: Cluster[];
  hotspots: Hotspot[];
  digestInput: {
    periodDays: number;
    categories: string;
    wardBreaches: string;
    clusters: string;
  };
}

export async function getTrendInputs(periodDays = 14): Promise<TrendInputs> {
  const now = new Date();
  const since = subDays(now, periodDays);
  const clusters = await getClusters(periodDays);

  const cases = await db.case.findMany({
    where: { createdAt: { gte: since } },
    select: {
      wardCode: true,
      categoryId: true,
      status: true,
      slaDueAt: true,
      resolvedAt: true,
    },
  });

  // Ward breach rate (resolved late, or still open past due).
  const wardAgg = new Map<string, { total: number; breached: number }>();
  for (const c of cases) {
    const cur = wardAgg.get(c.wardCode) ?? { total: 0, breached: 0 };
    cur.total += 1;
    const breached = c.resolvedAt
      ? c.resolvedAt > c.slaDueAt
      : c.status !== "CLOSED" && now > c.slaDueAt;
    if (breached) cur.breached += 1;
    wardAgg.set(c.wardCode, cur);
  }
  const hotspots: Hotspot[] = [...wardAgg.entries()]
    .filter(([, v]) => v.total >= 3)
    .map(([code, v]) => ({
      ward: `${wardName(code)} (${code})`,
      total: v.total,
      breachRate: Math.round((v.breached / v.total) * 100),
    }))
    .sort((a, b) => b.breachRate - a.breachRate)
    .slice(0, 5);

  const catCounts = new Map<string, number>();
  for (const c of cases) catCounts.set(c.categoryId, (catCounts.get(c.categoryId) ?? 0) + 1);
  const topCats = [...catCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return {
    clusters,
    hotspots,
    digestInput: {
      periodDays,
      categories: topCats.map(([id, n]) => `- ${catName(id)}: ${n}`).join("\n") || "- none",
      wardBreaches: hotspots.map((h) => `- ${h.ward}: ${h.breachRate}% breached`).join("\n") || "- none",
      clusters: clusters.map((c) => `- ${c.title} (${c.count} cases, ${c.wards.length} wards)`).join("\n") || "- none",
    },
  };
}
