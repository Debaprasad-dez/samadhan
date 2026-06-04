import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { createSession, homePathForRole } from "@/lib/auth";
import { OtpLoginInput, PasswordLoginInput } from "@/schemas/user";
import { ok, fail, failValidation } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import type { Role, SessionUser } from "@/types";

const DEV_OTP = "123456";

// In-memory password lockout (§9.6): 5 fails / 10 min → 15-min soft lock.
const fails = new Map<string, { count: number; until: number }>();
function isLocked(key: string): boolean {
  const f = fails.get(key);
  return !!f && f.count >= 5 && f.until > Date.now();
}
function recordFail(key: string): void {
  const now = Date.now();
  const f = fails.get(key);
  if (!f || f.until < now) {
    fails.set(key, { count: 1, until: now + 10 * 60_000 });
  } else {
    f.count += 1;
    if (f.count >= 5) f.until = now + 15 * 60_000;
  }
}
function clearFail(key: string): void {
  fails.delete(key);
}

function toSessionUser(u: User): SessionUser {
  return {
    id: u.id,
    role: u.role as Role,
    name: u.name,
    wardCode: u.wardCode,
    departmentCode: u.departmentCode,
    reputation: u.reputation,
    language: u.language,
  };
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`auth:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return fail(
      "RATE_LIMIT",
      `Too many attempts. Try again in ${rl.retryAfterSec}s.`,
      429,
    );
  }

  let json: Record<string, unknown>;
  try {
    json = (await req.json()) as Record<string, unknown>;
  } catch {
    return fail("BAD_JSON", "Invalid request body.", 400);
  }

  // ---- Citizen OTP flow ----
  if (typeof json.phone === "string") {
    const parsed = OtpLoginInput.safeParse(json);
    if (!parsed.success) return failValidation(parsed.error.flatten());
    if (parsed.data.otp !== DEV_OTP) {
      return fail(
        "BAD_OTP",
        "That code didn't match. Use 123456 in demo mode.",
        401,
      );
    }

    let user = await db.user.findUnique({ where: { phone: parsed.data.phone } });
    if (!user) {
      // First-time citizen registration on login (§1.7).
      user = await db.user.create({
        data: { role: "CITIZEN", name: "New Citizen", phone: parsed.data.phone },
      });
    }

    await createSession(user.id, user.role as Role);
    return ok({
      user: toSessionUser(user),
      redirectTo: homePathForRole(user.role as Role),
    });
  }

  // ---- Officer/Admin password flow ----
  if (typeof json.email === "string") {
    const parsed = PasswordLoginInput.safeParse(json);
    if (!parsed.success) return failValidation(parsed.error.flatten());

    const email = parsed.data.email.toLowerCase();
    const key = `pw:${email}`;
    if (isLocked(key)) {
      return fail(
        "LOCKED",
        "Too many failed attempts. Try again in 15 minutes.",
        429,
      );
    }

    const user = await db.user.findUnique({ where: { email } });
    if (
      !user ||
      !user.passwordHash ||
      !bcrypt.compareSync(parsed.data.password, user.passwordHash)
    ) {
      recordFail(key);
      return fail("BAD_CREDENTIALS", "Email or password is incorrect.", 401);
    }

    clearFail(key);
    await createSession(user.id, user.role as Role);
    return ok({
      user: toSessionUser(user),
      redirectTo: homePathForRole(user.role as Role),
    });
  }

  return fail(
    "VALIDATION",
    "Provide either phone + otp, or email + password.",
    400,
  );
}
