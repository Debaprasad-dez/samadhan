import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, fail, failValidation } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { predictSla } from "@/lib/ai/sla-predict";
import { CATEGORIES, slaDaysForCategory } from "@/lib/seed-data";
import { humanizeCode } from "@/lib/utils";

const Input = z.object({
  departmentCode: z.string(),
  categoryId: z.string(),
  wardCode: z.string(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in.", 401);

  const rl = rateLimit(`ai:${user.id}`, 30, 3_600_000);
  if (!rl.ok) return fail("RATE_LIMIT", "AI limit reached. Try again shortly.", 429);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("BAD_JSON", "Invalid request body.", 400);
  }
  const parsed = Input.safeParse(json);
  if (!parsed.success) return failValidation(parsed.error.flatten());
  const input = parsed.data;

  // Historical median resolution time for this category.
  const resolved = await db.case.findMany({
    where: {
      categoryId: input.categoryId,
      status: { in: ["RESOLVED", "CLOSED"] },
      resolvedAt: { not: null },
    },
    select: { createdAt: true, resolvedAt: true },
  });
  const days = resolved.map(
    (c) => ((c.resolvedAt ?? c.createdAt).getTime() - c.createdAt.getTime()) / 86_400_000,
  );
  const medianDays = days.length
    ? Math.round(median(days))
    : slaDaysForCategory(input.categoryId);

  const res = await predictSla({
    department: humanizeCode(input.departmentCode),
    category: CATEGORIES.find((c) => c.id === input.categoryId)?.name ?? "—",
    wardCode: input.wardCode,
    severity: input.severity,
    medianDays,
  });

  return ok({
    expectedDays: res.data.expectedDays,
    confidence: res.data.confidence,
    medianDays,
    fallback: res.fallback,
  });
}
