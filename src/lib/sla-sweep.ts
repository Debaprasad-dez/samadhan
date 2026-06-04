import { db } from "@/lib/db";

/**
 * Lazy SLA escalation (§5.7.1): on officer/admin requests, mark overdue, un-escalated,
 * still-open cases as ESCALATED and record an event. No cron needed for seeded volume.
 * Returns the number of cases escalated.
 */
export async function runSlaSweep(limit = 50): Promise<number> {
  const now = new Date();
  const overdue = await db.case.findMany({
    where: {
      escalated: false,
      slaDueAt: { lt: now },
      status: { notIn: ["RESOLVED", "CLOSED", "ESCALATED"] },
    },
    select: { id: true },
    take: limit,
  });
  if (overdue.length === 0) return 0;

  const ids = overdue.map((c) => c.id);
  await db.$transaction([
    db.case.updateMany({
      where: { id: { in: ids } },
      data: { escalated: true, status: "ESCALATED" },
    }),
    db.caseEvent.createMany({
      data: ids.map((caseId) => ({
        caseId,
        type: "ESCALATED",
        message: "SLA breached — auto-escalated.",
        metadata: JSON.stringify({ reason: "SLA_BREACH" }),
      })),
    }),
  ]);
  return overdue.length;
}
