import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";

/**
 * Citizen pulls an escalation forward. A case escalates on its own once the
 * charter limit lapses; this only lets the person who filed it act the moment
 * that happens, rather than waiting for the sweep.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in.", 401);

  const c = await db.case.findUnique({
    where: { id },
    select: { id: true, filedById: true, status: true, slaDueAt: true, escalated: true },
  });
  if (!c) return fail("NOT_FOUND", "Case not found.", 404);
  if (c.filedById !== user.id) {
    return fail("FORBIDDEN", "Only the person who filed this can escalate it.", 403);
  }
  if (c.escalated || c.status === "ESCALATED") {
    return fail("CONFLICT", "This case has already escalated.", 409);
  }
  if (c.status === "RESOLVED" || c.status === "CLOSED") {
    return fail("CONFLICT", "This case is already resolved.", 409);
  }
  if (c.slaDueAt.getTime() > Date.now()) {
    return fail(
      "CONFLICT",
      "It escalates on its own when the charter limit lapses — no need to ask.",
      409,
    );
  }

  await db.case.update({
    where: { id },
    data: { status: "ESCALATED", escalated: true },
  });
  await db.caseEvent.create({
    data: {
      caseId: id,
      actorId: user.id,
      type: "ESCALATED",
      message: "Escalated at the citizen's request after the charter limit lapsed.",
      metadata: JSON.stringify({ to: "ESCALATED", reason: "SLA_BREACH" }),
    },
  });

  return ok({ id, escalated: true });
}
