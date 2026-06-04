import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CosignInput } from "@/schemas/case";
import { ok, fail, failValidation } from "@/lib/api";
import { awardBadge, recomputeReputation } from "@/lib/badges";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in to co-sign.", 401);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("BAD_JSON", "Invalid request body.", 400);
  }
  const parsed = CosignInput.safeParse(json);
  if (!parsed.success) return failValidation(parsed.error.flatten());

  const c = await db.case.findUnique({
    where: { id },
    select: { id: true, filedById: true, number: true },
  });
  if (!c) return fail("NOT_FOUND", "Case not found.", 404);
  if (c.filedById === user.id) {
    return fail("FORBIDDEN", "You can't co-sign your own complaint.", 403);
  }

  const existing = await db.cosign.findUnique({
    where: { caseId_userId: { caseId: id, userId: user.id } },
  });
  if (existing) {
    return fail("CONFLICT", "You've already co-signed this complaint.", 409);
  }

  await db.cosign.create({
    data: { caseId: id, userId: user.id, reason: parsed.data.reason },
  });

  // Notify the original author (§5.3.4).
  await db.notification.create({
    data: {
      userId: c.filedById,
      title: "Someone co-signed your complaint",
      body: parsed.data.reason,
      link: `/cases/${id}`,
    },
  });

  // Neighbour badge at 5 co-signs (§5.3.2).
  const made = await db.cosign.count({ where: { userId: user.id } });
  if (made >= 5) await awardBadge(user.id, "neighbour");
  await recomputeReputation(user.id);

  const count = await db.cosign.count({ where: { caseId: id } });
  return ok({ ok: true, count });
}
