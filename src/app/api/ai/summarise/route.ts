import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, fail, failValidation } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { summariseCase } from "@/lib/ai/summarise";
import { CATEGORIES } from "@/lib/seed-data";
import { humanizeCode } from "@/lib/utils";

const Input = z.object({ caseId: z.string() });

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

  const c = await db.case.findUnique({
    where: { id: parsed.data.caseId },
    include: {
      events: { orderBy: { createdAt: "asc" }, take: 20 },
      _count: { select: { cosigns: true } },
    },
  });
  if (!c) return fail("NOT_FOUND", "Case not found.", 404);

  const res = await summariseCase({
    number: c.number,
    title: c.title,
    body: c.body,
    wardCode: c.wardCode,
    department: humanizeCode(c.departmentCode),
    category: CATEGORIES.find((x) => x.id === c.categoryId)?.name ?? "—",
    severity: c.severity,
    createdAt: c.createdAt.toISOString(),
    cosignCount: c._count.cosigns,
    events: c.events
      .map((e) => `- ${e.type}: ${e.message ?? ""}`)
      .join("\n"),
  });

  return ok({ summary: res.data.summary, fallback: res.fallback });
}
