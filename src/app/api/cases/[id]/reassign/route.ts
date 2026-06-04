import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReassignInput } from "@/schemas/case";
import { ok, fail, failValidation } from "@/lib/api";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in.", 401);

  const me = await db.user.findUnique({
    where: { id: user.id },
    select: { isDeptLead: true, departmentCode: true },
  });
  const isAdmin = user.role === "ADMIN";
  const isLead = user.role === "OFFICER" && !!me?.isDeptLead;
  if (!isAdmin && !isLead) {
    return fail("FORBIDDEN", "Only a department lead or admin can reassign.", 403);
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("BAD_JSON", "Invalid request body.", 400);
  }
  const parsed = ReassignInput.safeParse(json);
  if (!parsed.success) return failValidation(parsed.error.flatten());

  const c = await db.case.findUnique({
    where: { id },
    select: { id: true, departmentCode: true },
  });
  if (!c) return fail("NOT_FOUND", "Case not found.", 404);
  if (isLead && me?.departmentCode !== c.departmentCode) {
    return fail("FORBIDDEN", "Case is outside your department.", 403);
  }

  const target = await db.user.findUnique({
    where: { id: parsed.data.toUserId },
    select: { id: true, role: true, departmentCode: true, name: true },
  });
  if (!target || target.role !== "OFFICER") {
    return fail("VALIDATION", "Pick a valid officer.", 400, { field: "toUserId" });
  }
  if (target.departmentCode !== c.departmentCode) {
    return fail("VALIDATION", "Officer is in a different department.", 400, {
      field: "toUserId",
    });
  }

  await db.case.update({ where: { id }, data: { assignedToId: target.id } });
  await db.caseEvent.create({
    data: {
      caseId: id,
      actorId: user.id,
      type: "REASSIGNED",
      message: parsed.data.reason,
      metadata: JSON.stringify({ toUserId: target.id }),
    },
  });
  await db.notification.create({
    data: {
      userId: target.id,
      title: "A case was assigned to you",
      body: parsed.data.reason,
      link: `/case/${id}`,
    },
  });

  return ok({ ok: true });
}
