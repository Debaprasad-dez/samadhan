import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpdateSettingsInput } from "@/schemas/user";
import { ok, fail, failValidation } from "@/lib/api";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in.", 401);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("BAD_JSON", "Invalid request body.", 400);
  }
  const parsed = UpdateSettingsInput.safeParse(json);
  if (!parsed.success) return failValidation(parsed.error.flatten());

  await db.user.update({ where: { id: user.id }, data: parsed.data });
  return ok({ ok: true });
}
