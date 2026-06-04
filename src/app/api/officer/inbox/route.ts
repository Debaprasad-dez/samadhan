import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { runSlaSweep } from "@/lib/sla-sweep";
import type { Severity } from "@/types";

const SEVERITY_WEIGHT: Record<Severity, number> = { LOW: 1, MEDIUM: 3, HIGH: 6 };
const OPEN_STATES = [
  "OPEN",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "AWAITING_INFO",
  "ESCALATED",
];

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in.", 401);
  if (user.role !== "OFFICER" && user.role !== "ADMIN") {
    return fail("FORBIDDEN", "Officers only.", 403);
  }

  // Lazy SLA escalation on every officer/admin queue load.
  await runSlaSweep();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const severity = url.searchParams.get("severity");
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));

  const where: Prisma.CaseWhereInput = {};
  // Officers see their department's queue; admins see all.
  if (user.role === "OFFICER" && user.departmentCode) {
    where.departmentCode = user.departmentCode;
  }
  // "open" (default) → open work states; "all" → no status filter; else exact status.
  if (!status || status === "open") where.status = { in: OPEN_STATES };
  else if (status !== "all") where.status = status;
  if (severity) where.severity = severity;

  const rows = await db.case.findMany({
    where,
    take: 300,
    select: {
      id: true,
      number: true,
      title: true,
      status: true,
      severity: true,
      wardCode: true,
      createdAt: true,
      slaDueAt: true,
      escalated: true,
      assignedToId: true,
      _count: { select: { cosigns: true, upvotes: true } },
    },
  });

  const now = Date.now();
  const ranked = rows
    .map((c) => {
      const ageDays = (now - c.createdAt.getTime()) / 86_400_000;
      const breach = c.slaDueAt.getTime() < now;
      const rank =
        SEVERITY_WEIGHT[c.severity as Severity] +
        c._count.cosigns * 0.5 +
        (breach ? 5 : 0) +
        ageDays * 0.1;
      return { ...c, rank: Number(rank.toFixed(2)) };
    })
    .sort(
      (a, b) =>
        b.rank - a.rank || a.createdAt.getTime() - b.createdAt.getTime(),
    );

  const total = ranked.length;
  const cases = ranked.slice((page - 1) * limit, page * limit);

  return ok({ cases, total, page });
}
