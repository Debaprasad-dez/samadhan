import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, fail, failValidation } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { draftRti } from "@/lib/ai/rti";
import { humanizeCode, formatIST } from "@/lib/utils";

const Input = z.object({ caseId: z.string() });
const STALLED_DAYS = 30;

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

  const c = await db.case.findUnique({
    where: { id: parsed.data.caseId },
    select: {
      number: true,
      title: true,
      body: true,
      departmentCode: true,
      status: true,
      isPublic: true,
      filedById: true,
      createdAt: true,
    },
  });
  if (!c) return fail("NOT_FOUND", "Case not found.", 404);

  const isOwner = user.id === c.filedById;
  const isStaff = user.role === "OFFICER" || user.role === "ADMIN";
  if (!isOwner && !isStaff) return fail("FORBIDDEN", "Not your complaint.", 403);

  if (c.status === "RESOLVED" || c.status === "CLOSED") {
    return fail("CONFLICT", "This complaint is already resolved.", 409);
  }

  const daysSince = Math.floor(
    (Date.now() - c.createdAt.getTime()) / 86_400_000,
  );
  if (daysSince < STALLED_DAYS) {
    return fail(
      "TOO_EARLY",
      `An RTI can be drafted after ${STALLED_DAYS} days. This case is ${daysSince} days old.`,
      400,
    );
  }

  const res = await draftRti({
    number: c.number,
    createdAt: formatIST(c.createdAt),
    department: humanizeCode(c.departmentCode),
    title: c.title,
    body: c.body,
    daysSince,
  });

  return ok({ draft: res.data.draft, fallback: res.fallback });
}
