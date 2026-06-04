import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { ok, fail, failValidation } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { scoreDisposal } from "@/lib/ai/quality";

const Input = z.object({
  closureNote: z.string().min(1).max(2000),
  evidence: z
    .object({ before: z.boolean().optional(), after: z.boolean().optional() })
    .optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in.", 401);
  if (user.role !== "OFFICER" && user.role !== "ADMIN") {
    return fail("FORBIDDEN", "Officers only.", 403);
  }

  const rl = rateLimit(`ai:${user.id}`, 30, 3_600_000);
  if (!rl.ok) {
    return fail("RATE_LIMIT", "AI limit reached. Try again shortly.", 429);
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("BAD_JSON", "Invalid request body.", 400);
  }
  const parsed = Input.safeParse(json);
  if (!parsed.success) return failValidation(parsed.error.flatten());

  const summary = parsed.data.evidence
    ? `before:${!!parsed.data.evidence.before} after:${!!parsed.data.evidence.after}`
    : "none";
  const res = await scoreDisposal(parsed.data.closureNote, summary);
  return ok({ ...res.data, fallback: res.fallback });
}
