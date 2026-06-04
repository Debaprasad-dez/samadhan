import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();

  const c = await db.case.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true, role: true } } },
      },
      evidence: true,
      filedBy: {
        select: { id: true, name: true, reputation: true, wardCode: true },
      },
      assignedTo: { select: { name: true } },
      _count: { select: { upvotes: true, cosigns: true } },
    },
  });

  if (!c) {
    return fail("NOT_FOUND", "This complaint doesn't exist or was removed.", 404);
  }

  const isOwner = user?.id === c.filedById;
  const isStaff = user?.role === "OFFICER" || user?.role === "ADMIN";
  // Private case guessed by URL → 404, don't leak existence (§10.2).
  if (!isOwner && !isStaff && !c.isPublic) {
    return fail("NOT_FOUND", "This complaint doesn't exist or was removed.", 404);
  }

  return ok({ case: c });
}
