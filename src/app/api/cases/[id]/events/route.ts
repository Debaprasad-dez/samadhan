import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatusUpdateInput } from "@/schemas/case";
import { ok, fail, failValidation } from "@/lib/api";
import { awardBadge, recomputeReputation } from "@/lib/badges";
import type { CaseStatus, EventType } from "@/types";

// status → { event type, side effects }
const MAP: Record<
  string,
  { event: EventType; setResolved?: boolean; setEscalated?: boolean }
> = {
  ACKNOWLEDGED: { event: "ACKNOWLEDGED" },
  IN_PROGRESS: { event: "STATUS_CHANGED" },
  AWAITING_INFO: { event: "INFO_REQUESTED" },
  RESOLVED: { event: "RESOLVED", setResolved: true },
  ESCALATED: { event: "ESCALATED", setEscalated: true },
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in.", 401);
  if (user.role !== "OFFICER" && user.role !== "ADMIN") {
    return fail("FORBIDDEN", "Officers only.", 403);
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("BAD_JSON", "Invalid request body.", 400);
  }
  const parsed = StatusUpdateInput.safeParse(json);
  if (!parsed.success) return failValidation(parsed.error.flatten());
  const { status, message } = parsed.data;

  const c = await db.case.findUnique({
    where: { id },
    select: { id: true, filedById: true, departmentCode: true, assignedToId: true },
  });
  if (!c) return fail("NOT_FOUND", "Case not found.", 404);
  if (user.role === "OFFICER" && user.departmentCode !== c.departmentCode) {
    return fail("FORBIDDEN", "Case is outside your department.", 403);
  }

  const map = MAP[status];
  const now = new Date();

  const event = await db.caseEvent.create({
    data: {
      caseId: id,
      actorId: user.id,
      type: map.event,
      message: message ?? null,
      metadata: JSON.stringify({ to: status }),
    },
  });

  await db.case.update({
    where: { id },
    data: {
      status: status as CaseStatus,
      assignedToId: c.assignedToId ?? user.id,
      ...(map.setResolved ? { resolvedAt: now } : {}),
      ...(map.setEscalated ? { escalated: true } : {}),
    },
  });

  // Notify the filer of the status change.
  await db.notification.create({
    data: {
      userId: c.filedById,
      title: `Update on your complaint`,
      body: `Status changed to ${status.replace("_", " ").toLowerCase()}.`,
      link: `/cases/${id}`,
    },
  });

  // On resolution: reward the filer (Verified Resolver + reputation).
  if (map.setResolved) {
    await awardBadge(c.filedById, "verified-resolver");
    await recomputeReputation(c.filedById);
  }

  return ok({ event, status });
}
