import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";

/** Attach an already-uploaded file to a case. Only the person who filed it. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in.", 401);

  let body: { url?: string; kind?: string; filename?: string; sizeBytes?: number };
  try {
    body = await req.json();
  } catch {
    return fail("BAD_JSON", "Invalid request body.", 400);
  }
  const { url, kind, filename, sizeBytes } = body;
  if (!url || !kind || !filename) {
    return fail("VALIDATION", "url, kind and filename are required.", 400);
  }
  // Only accept paths our own upload route produced.
  if (!url.startsWith("/uploads/")) {
    return fail("VALIDATION", "Unsupported file location.", 400);
  }

  const c = await db.case.findUnique({
    where: { id },
    select: { id: true, filedById: true },
  });
  if (!c) return fail("NOT_FOUND", "Case not found.", 404);
  if (c.filedById !== user.id) {
    return fail("FORBIDDEN", "Only the person who filed this can add evidence.", 403);
  }

  const count = await db.evidence.count({ where: { caseId: id } });
  if (count >= 10) return fail("CONFLICT", "This case already has 10 files.", 409);

  const ev = await db.evidence.create({
    data: { caseId: id, url, kind, filename, sizeBytes: sizeBytes ?? 0 },
  });
  await db.caseEvent.create({
    data: {
      caseId: id,
      actorId: user.id,
      type: "EVIDENCE_ADDED",
      message: "Citizen added a photo.",
    },
  });

  return ok({ id: ev.id, url: ev.url });
}
