import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { RequestInfoInput } from "@/schemas/case";
import { ok, fail, failValidation } from "@/lib/api";

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
  const parsed = RequestInfoInput.safeParse(json);
  if (!parsed.success) return failValidation(parsed.error.flatten());

  const c = await db.case.findUnique({
    where: { id },
    select: { id: true, filedById: true, departmentCode: true },
  });
  if (!c) return fail("NOT_FOUND", "Case not found.", 404);
  if (user.role === "OFFICER" && user.departmentCode !== c.departmentCode) {
    return fail("FORBIDDEN", "Case is outside your department.", 403);
  }

  await db.caseEvent.create({
    data: {
      caseId: id,
      actorId: user.id,
      type: "INFO_REQUESTED",
      message: parsed.data.question,
    },
  });
  await db.case.update({ where: { id }, data: { status: "AWAITING_INFO" } });
  await db.notification.create({
    data: {
      userId: c.filedById,
      title: "More information requested",
      body: parsed.data.question,
      link: `/cases/${id}`,
    },
  });

  return ok({ ok: true });
}
