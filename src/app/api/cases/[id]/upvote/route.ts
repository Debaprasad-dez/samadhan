import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { awardBadge, recomputeReputation } from "@/lib/badges";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in to upvote.", 401);

  const c = await db.case.findUnique({
    where: { id },
    select: { id: true, filedById: true },
  });
  if (!c) return fail("NOT_FOUND", "Case not found.", 404);
  if (c.filedById === user.id) {
    return fail("FORBIDDEN", "You can't upvote your own complaint.", 403);
  }

  const existing = await db.upvote.findUnique({
    where: { caseId_userId: { caseId: id, userId: user.id } },
  });

  let upvoted: boolean;
  if (existing) {
    await db.upvote.delete({ where: { id: existing.id } });
    upvoted = false;
  } else {
    await db.upvote.create({ data: { caseId: id, userId: user.id } });
    upvoted = true;
  }

  const count = await db.upvote.count({ where: { caseId: id } });

  // Watchdog badge at 10 helpful upvotes given (§5.3.2).
  if (upvoted) {
    const given = await db.upvote.count({ where: { userId: user.id } });
    if (given >= 10) await awardBadge(user.id, "watchdog");
  }
  await recomputeReputation(user.id);

  return ok({ upvoted, count });
}
