import { db } from "@/lib/db";
import { createSession, homePathForRole } from "@/lib/auth";
import { RoleSwitchInput } from "@/schemas/user";
import { ok, fail, failValidation } from "@/lib/api";
import type { Role } from "@/types";

// Demo persona switcher (§4.4). Gated behind NEXT_PUBLIC_DEMO_MODE.
const PERSONA = {
  citizen: { kind: "phone", value: "+919999900001" },
  officer: { kind: "email", value: "rajesh@mcgm.gov.in" },
  admin: { kind: "email", value: "anita@mcgm.gov.in" },
} as const;

export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    return fail("FORBIDDEN", "Demo mode is disabled.", 403);
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("BAD_JSON", "Invalid request body.", 400);
  }

  const parsed = RoleSwitchInput.safeParse(json);
  if (!parsed.success) return failValidation(parsed.error.flatten());

  const target = PERSONA[parsed.data.persona];
  const user =
    target.kind === "phone"
      ? await db.user.findUnique({ where: { phone: target.value } })
      : await db.user.findUnique({ where: { email: target.value } });

  if (!user) return fail("NOT_FOUND", "Demo persona not seeded.", 404);

  await createSession(user.id, user.role as Role);
  return ok({
    user: { id: user.id, role: user.role, name: user.name },
    redirectTo: homePathForRole(user.role as Role),
  });
}
