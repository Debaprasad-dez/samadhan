import { Prisma } from "@prisma/client";
import { subDays } from "date-fns";
import { db } from "@/lib/db";
import { ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { WARDS, CATEGORIES } from "@/lib/seed-data";

/** Mark which cases the current viewer has upvoted (for toggle state). */
async function attachViewer(rows: Row[], userId: string | undefined) {
  if (!userId || rows.length === 0) return rows;
  const ups = await db.upvote.findMany({
    where: { userId, caseId: { in: rows.map((r) => r.id) } },
    select: { caseId: true },
  });
  const set = new Set(ups.map((u) => u.caseId));
  return rows.map((r) => ({ ...r, viewerUpvoted: set.has(r.id) }));
}

const wardName = (code: string) => WARDS.find((w) => w.code === code)?.name ?? code;
const catName = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? "—";

interface Row {
  id: string;
  number: string;
  wardCode: string;
  author: string;
  departmentCode: string;
  categoryName: string;
  status: string;
  severity: string;
  snippet: string;
  upvotes: number;
  cosigns: number;
  createdAt: Date;
  slaDueAt: Date;
  escalated: boolean;
  viewerUpvoted?: boolean;
  isOwn?: boolean;
}

// Keeps filedById server-side (the feed is anonymised) — only the derived isOwn
// boolean is sent to the client.
function anonymise(
  c: {
    id: string;
    number: string;
    wardCode: string;
    departmentCode: string;
    categoryId: string;
    status: string;
    severity: string;
    body: string;
    createdAt: Date;
    slaDueAt: Date;
    escalated: boolean;
    filedById: string;
    _count: { upvotes: number; cosigns: number };
  },
  userId: string | undefined,
): Row {
  return {
    id: c.id,
    number: c.number,
    wardCode: c.wardCode,
    author: `A citizen in ${wardName(c.wardCode)}`,
    departmentCode: c.departmentCode,
    categoryName: catName(c.categoryId),
    status: c.status,
    severity: c.severity,
    snippet: c.body.slice(0, 200),
    upvotes: c._count.upvotes,
    cosigns: c._count.cosigns,
    createdAt: c.createdAt,
    slaDueAt: c.slaDueAt,
    escalated: c.escalated,
    isOwn: !!userId && c.filedById === userId,
  };
}

const SELECT = {
  id: true,
  number: true,
  wardCode: true,
  departmentCode: true,
  categoryId: true,
  status: true,
  severity: true,
  body: true,
  createdAt: true,
  slaDueAt: true,
  escalated: true,
  filedById: true,
  _count: { select: { upvotes: true, cosigns: true } },
} as const;

export async function GET(req: Request) {
  const user = await getCurrentUser();
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope");
  const ward = url.searchParams.get("ward");
  const dept = url.searchParams.get("dept");
  const status = url.searchParams.get("status");
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = 9;

  // Hot zone: top 5 public cases by upvotes in the last 7 days (§5.2.1).
  if (scope === "hot") {
    const since = subDays(new Date(), 7);
    const grouped = await db.upvote.groupBy({
      by: ["caseId"],
      where: { createdAt: { gte: since }, case: { isPublic: true } },
      _count: { caseId: true },
      orderBy: { _count: { caseId: "desc" } },
      take: 5,
    });
    const ids = grouped.map((g) => g.caseId);
    const cases = await db.case.findMany({
      where: { id: { in: ids } },
      select: SELECT,
    });
    const ordered = ids
      .map((id) => cases.find((c) => c.id === id))
      .filter((c): c is NonNullable<typeof c> => !!c)
      .map((c) => anonymise(c, user?.id));
    return ok({ cases: await attachViewer(ordered, user?.id) });
  }

  const where: Prisma.CaseWhereInput = { isPublic: true };
  if (ward) where.wardCode = ward;
  if (dept) where.departmentCode = dept;
  if (status) where.status = status;

  const [rows, total] = await Promise.all([
    db.case.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: SELECT,
    }),
    db.case.count({ where }),
  ]);

  return ok({
    cases: await attachViewer(
      rows.map((c) => anonymise(c, user?.id)),
      user?.id,
    ),
    total,
    page,
  });
}
