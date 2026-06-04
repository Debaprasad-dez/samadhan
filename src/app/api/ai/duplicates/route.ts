import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { ok, fail, failValidation } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { findDuplicates } from "@/lib/ai/duplicates";

const Input = z.object({
  title: z.string().max(200).default(""),
  body: z.string().min(1).max(2000),
  wardCode: z.string(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in.", 401);

  const rl = rateLimit(`ai:${user.id}`, 30, 3_600_000);
  if (!rl.ok) {
    return fail(
      "RATE_LIMIT",
      `Slow down — you've hit the AI limit. Try again in ${Math.ceil(rl.retryAfterSec / 60)} min.`,
      429,
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("BAD_JSON", "Invalid request body.", 400);
  }
  const parsed = Input.safeParse(json);
  if (!parsed.success) return failValidation(parsed.error.flatten());

  const matches = await findDuplicates(
    parsed.data.title,
    parsed.data.body,
    parsed.data.wardCode,
  );
  return ok({ matches });
}
