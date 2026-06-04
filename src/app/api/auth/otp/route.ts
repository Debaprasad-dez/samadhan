import { OtpRequestInput } from "@/schemas/user";
import { ok, fail, failValidation } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit(`auth:${clientIp(req)}`, 5, 60_000);
  if (!rl.ok) {
    return fail(
      "RATE_LIMIT",
      `Too many attempts. Try again in ${rl.retryAfterSec}s.`,
      429,
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("BAD_JSON", "Invalid request body.", 400);
  }

  const parsed = OtpRequestInput.safeParse(json);
  if (!parsed.success) return failValidation(parsed.error.flatten());

  const devMode =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  // Mock OTP: always 123456 in dev/demo (§9.1). No SMS is actually sent.
  return ok({ ok: true, ...(devMode ? { devOtp: "123456" } : {}) });
}
