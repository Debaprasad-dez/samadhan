import { db } from "@/lib/db";
import { WARDS, DEPARTMENTS, CATEGORIES } from "@/lib/seed-data";

/**
 * The 24-ward dataset behind the 3D explorer. Every figure is measured from
 * real cases: height and colour on the block, the department table, and the
 * ranking are all derived here so the client only draws.
 */
export interface ExplorerDept {
  /** Display name, e.g. "BMC · Sanitation". */
  name: string;
  /** Icon key the client knows how to draw. */
  icon: string;
  /** Median days to close in this ward. */
  med: number;
  /** Charter limit for this department, in days. */
  limit: number;
}

export interface ExplorerWard {
  id: string; // lowercase code — stable key for the 3D scene
  code: string;
  /** "K/E" — the ward's charter name. */
  name: string;
  /** "Andheri East, Western Suburbs". */
  zone: string;
  open: number;
  /** Share of settled cases closed within the charter limit, 0–100. */
  sla: number;
  /** Median days to close. */
  med: number;
  /** 1 = best of 24, ranked on sla. */
  rank: number;
  mine?: boolean;
  depts: ExplorerDept[];
  /** Busiest categories by open complaints — the mockup's "worst cells" slot. */
  cells: { name: string; open: number }[];
}

const DEPT_ICON: Record<string, string> = {
  ELECTRICITY: "bolt",
  SANITATION: "trash",
  WATER: "drop",
  ROADS: "road",
  HEALTH: "health",
  EDUCATION: "book",
  POLICE: "shield",
  PUBLIC_WORKS: "works",
};

/** The body that answers for each department, as the charter names it. */
const DEPT_BODY: Record<string, string> = {
  ELECTRICITY: "BEST",
  SANITATION: "BMC",
  WATER: "BWSSB",
  ROADS: "BMC",
  HEALTH: "BMC",
  EDUCATION: "BMC",
  POLICE: "MPD",
  PUBLIC_WORKS: "PWD",
};

/** "KE" → "K/E"; single-letter codes are left alone. */
export function wardLabel(code: string): string {
  return code.length === 2 ? `${code[0]}/${code[1]}` : code;
}

const median = (xs: number[]) =>
  xs.length === 0 ? 0 : [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const DAY = 86_400_000;
const SETTLED = ["RESOLVED", "CLOSED"];

/** Charter limit for a department: the median SLA across its categories. */
const deptLimit = (code: string) =>
  Math.round(
    median(CATEGORIES.filter((c) => c.departmentCode === code).map((c) => c.slaDays)),
  ) || 7;

export async function getWardExplorer(myWard?: string | null): Promise<ExplorerWard[]> {
  const cases = await db.case.findMany({
    select: {
      wardCode: true,
      departmentCode: true,
      categoryId: true,
      status: true,
      createdAt: true,
      resolvedAt: true,
      slaDueAt: true,
    },
  });

  const catName = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? "—";
  const deptName = (code: string) => {
    const label = DEPARTMENTS.find((d) => d.code === code)?.name ?? code;
    return `${DEPT_BODY[code] ?? "BMC"} · ${label}`;
  };

  const rows = WARDS.map((w) => {
    const mine = cases.filter((c) => c.wardCode === w.code);
    const settled = mine.filter((c) => SETTLED.includes(c.status) && c.resolvedAt);
    const onTime = settled.filter((c) => c.resolvedAt! <= c.slaDueAt).length;
    const daysToClose = settled.map(
      (c) => (c.resolvedAt!.getTime() - c.createdAt.getTime()) / DAY,
    );

    // Department table: the four that carry the most work in this ward.
    const byDept = new Map<string, typeof mine>();
    for (const c of mine) {
      const list = byDept.get(c.departmentCode) ?? [];
      list.push(c);
      byDept.set(c.departmentCode, list);
    }
    const depts: ExplorerDept[] = [...byDept.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 4)
      .map(([code, list]) => {
        const done = list.filter((c) => SETTLED.includes(c.status) && c.resolvedAt);
        const med = median(
          done.map((c) => (c.resolvedAt!.getTime() - c.createdAt.getTime()) / DAY),
        );
        return {
          name: deptName(code),
          icon: DEPT_ICON[code] ?? "works",
          med: Math.round(med * 10) / 10,
          limit: deptLimit(code),
        };
      });

    // Busiest categories, counted on what is still open.
    const openCounts = new Map<string, number>();
    for (const c of mine) {
      if (SETTLED.includes(c.status)) continue;
      openCounts.set(c.categoryId, (openCounts.get(c.categoryId) ?? 0) + 1);
    }
    const cells = [...openCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, open]) => ({ name: catName(id), open }));

    return {
      id: w.code.toLowerCase(),
      code: w.code,
      name: wardLabel(w.code),
      zone: `${w.name}, ${w.zone}`,
      open: mine.filter((c) => !SETTLED.includes(c.status)).length,
      sla: settled.length === 0 ? 0 : Math.round((onTime / settled.length) * 100),
      med: Math.round(median(daysToClose) * 10) / 10,
      rank: 0,
      mine: myWard ? w.code === myWard : undefined,
      depts,
      cells,
    };
  });

  // Rank on share closed within charter time, not on volume filed.
  [...rows]
    .sort((a, b) => b.sla - a.sla)
    .forEach((row, i) => {
      row.rank = i + 1;
    });

  return rows;
}
