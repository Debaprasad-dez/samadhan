import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { awardBadge, recomputeReputation } from "@/lib/badges";

/**
 * Citizen closes the loop on their own case: either confirms the fix (case
 * CLOSED) or says it isn't fixed (case reopened, original clock kept). Only the
 * filer may do this, and only while the case is RESOLVED.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in.", 401);

  let confirmed = true;
  try {
    const body = (await req.json()) as { confirmed?: boolean };
    confirmed = body.confirmed !== false;
  } catch {
    /* default: confirm */
  }

  const c = await db.case.findUnique({
    where: { id },
    select: { id: true, filedById: true, status: true },
  });
  if (!c) return fail("NOT_FOUND", "Case not found.", 404);
  if (c.filedById !== user.id) {
    return fail("FORBIDDEN", "Only the person who filed this can confirm it.", 403);
  }
  if (c.status !== "RESOLVED") {
    return fail("CONFLICT", "This case isn't awaiting your confirmation.", 409);
  }

  const now = new Date();
  if (confirmed) {
    await db.case.update({
      where: { id },
      data: { status: "CLOSED", closedAt: now },
    });
    await db.caseEvent.create({
      data: {
        caseId: id,
        actorId: user.id,
        type: "CLOSED",
        message: "Citizen confirmed the fix.",
        metadata: JSON.stringify({ to: "CLOSED", confirmedByCitizen: true }),
      },
    });
    // Reputation accrues on confirmed outcomes only (invariant 6).
    await awardBadge(user.id, "verified-resolver");
    await recomputeReputation(user.id);
  } else {
    // Reopening keeps the original clock: slaDueAt is untouched.
    await db.case.update({
      where: { id },
      data: { status: "IN_PROGRESS", resolvedAt: null, reopenedAt: now },
    });
    await db.caseEvent.create({
      data: {
        caseId: id,
        actorId: user.id,
        type: "REOPENED",
        message: "Citizen reports the issue is not fixed.",
        metadata: JSON.stringify({ to: "IN_PROGRESS" }),
      },
    });
  }

  return ok({ id, confirmed });
}
