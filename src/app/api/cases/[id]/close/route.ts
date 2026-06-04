import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CloseCaseInput } from "@/schemas/case";
import { ok, fail, failValidation } from "@/lib/api";
import { awardBadge, recomputeReputation } from "@/lib/badges";
import { scoreDisposal } from "@/lib/ai/quality";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in.", 401);
  if (user.role !== "OFFICER" && user.role !== "ADMIN") {
    return fail("FORBIDDEN", "Officers only.", 403);
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("BAD_JSON", "Invalid request body.", 400);
  }
  const parsed = CloseCaseInput.safeParse(json);
  if (!parsed.success) return failValidation(parsed.error.flatten());
  const { closureNote, beforeEvidenceId, afterEvidenceUrl } = parsed.data;

  const c = await db.case.findUnique({
    where: { id },
    select: {
      id: true,
      filedById: true,
      departmentCode: true,
      resolvedAt: true,
      status: true,
      _count: { select: { evidence: true } },
    },
  });
  if (!c) return fail("NOT_FOUND", "Case not found.", 404);
  if (user.role === "OFFICER" && user.departmentCode !== c.departmentCode) {
    return fail("FORBIDDEN", "Case is outside your department.", 403);
  }
  if (c.status === "CLOSED") {
    return fail("CONFLICT", "This case is already closed.", 409);
  }

  // Disposal quality scoring (§5.4.5).
  const evidenceSummary = `attachments:${c._count.evidence} before:${!!beforeEvidenceId} after:${!!afterEvidenceUrl}`;
  const quality = await scoreDisposal(closureNote, evidenceSummary);
  const now = new Date();

  // Mark before/after evidence if referenced.
  if (beforeEvidenceId) {
    await db.evidence
      .update({
        where: { id: beforeEvidenceId },
        data: { isBeforeAfter: "before" },
      })
      .catch(() => undefined);
  }
  if (afterEvidenceUrl) {
    await db.evidence.create({
      data: {
        caseId: id,
        url: afterEvidenceUrl,
        kind: "photo",
        filename: "after.jpg",
        sizeBytes: 0,
        isBeforeAfter: "after",
      },
    });
  }

  const resolvedAt = c.resolvedAt ?? now;
  await db.case.update({
    where: { id },
    data: {
      status: "CLOSED",
      closedAt: now,
      resolvedAt,
      qualityScore: quality.data.score,
      isBoilerplate: quality.data.isBoilerplate,
    },
  });

  // Events: ensure a RESOLVED marker, then CLOSED with the note.
  if (!c.resolvedAt) {
    await db.caseEvent.create({
      data: {
        caseId: id,
        actorId: user.id,
        type: "RESOLVED",
        message: "Resolution completed.",
      },
    });
  }
  await db.caseEvent.create({
    data: {
      caseId: id,
      actorId: user.id,
      type: "CLOSED",
      message: closureNote,
      metadata: JSON.stringify({
        qualityScore: quality.data.score,
        isBoilerplate: quality.data.isBoilerplate,
      }),
    },
  });

  // Reward filer + notify.
  await awardBadge(c.filedById, "verified-resolver");
  await recomputeReputation(c.filedById);
  await db.notification.create({
    data: {
      userId: c.filedById,
      title: "Your complaint was resolved",
      body: quality.data.isBoilerplate
        ? "Marked resolved — review the closure; it may be inadequate."
        : "Marked resolved with a closure note.",
      link: `/cases/${id}`,
    },
  });

  return ok({
    case: {
      id,
      status: "CLOSED",
      qualityScore: quality.data.score,
      isBoilerplate: quality.data.isBoilerplate,
      closedAt: now.toISOString(),
    },
    quality: {
      score: quality.data.score,
      isBoilerplate: quality.data.isBoilerplate,
      reasoning: quality.data.reasoning,
    },
  });
}
