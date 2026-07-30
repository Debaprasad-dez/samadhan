import { Prisma } from "@prisma/client";
import { subSeconds } from "date-fns";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateCaseInput } from "@/schemas/case";
import { ok, fail, failValidation } from "@/lib/api";
import { computeSlaDueAt } from "@/lib/sla";
import { CATEGORIES } from "@/lib/seed-data";
import { awardBadge, recomputeReputation } from "@/lib/badges";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in to view your cases.", 401);

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 10));

  const where: Prisma.CaseWhereInput = { filedById: user.id };
  if (status && status !== "all") {
    if (status === "open")
      where.status = { in: ["OPEN", "ACKNOWLEDGED", "AWAITING_INFO"] };
    else if (status === "in-progress") where.status = "IN_PROGRESS";
    else if (status === "resolved") where.status = { in: ["RESOLVED", "CLOSED"] };
    else if (status === "escalated") where.status = "ESCALATED";
    else where.status = status;
  }

  const [cases, total] = await Promise.all([
    db.case.findMany({
      where,
      // Invariant 4: sort by time remaining (soonest-due / most overdue first),
      // never by date filed.
      orderBy: { slaDueAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        number: true,
        title: true,
        status: true,
        severity: true,
        wardCode: true,
        departmentCode: true,
        slaDueAt: true,
        createdAt: true,
        updatedAt: true,
        escalated: true,
        _count: { select: { upvotes: true, cosigns: true } },
        evidence: { take: 1, select: { url: true, kind: true } },
      },
    }),
    db.case.count({ where }),
  ]);

  return ok({ cases, total, page });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in to file a complaint.", 401);
  if (user.role !== "CITIZEN") {
    return fail("FORBIDDEN", "Only citizens file complaints here.", 403);
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("BAD_JSON", "Invalid request body.", 400);
  }

  const parsed = CreateCaseInput.safeParse(json);
  if (!parsed.success) return failValidation(parsed.error.flatten());
  const input = parsed.data;

  const cat = CATEGORIES.find((c) => c.id === input.categoryId);
  if (!cat || cat.departmentCode !== input.departmentCode) {
    return fail("VALIDATION", "Category does not match department.", 400, {
      field: "categoryId",
    });
  }

  // Idempotency (§12.3): same filer + identical body within 60s → return existing.
  const dup = await db.case.findFirst({
    where: {
      filedById: user.id,
      body: input.body,
      createdAt: { gte: subSeconds(new Date(), 60) },
    },
    select: { id: true, number: true, status: true, slaDueAt: true, title: true },
  });
  if (dup) return ok({ case: dup }, 200);

  const firstComplaint =
    (await db.case.count({ where: { filedById: user.id } })) === 0;

  const total = await db.case.count();
  const number = `SMD-2026-${String(1000 + total + 1).padStart(6, "0")}`;
  const now = new Date();
  const slaDueAt = computeSlaDueAt(now, input.categoryId);

  const created = await db.case.create({
    data: {
      number,
      title: input.title,
      body: input.body,
      status: "OPEN",
      severity: input.severity,
      wardCode: input.wardCode,
      departmentCode: input.departmentCode,
      categoryId: input.categoryId,
      filedById: user.id,
      slaDueAt,
      isPublic: input.isPublic,
      createdAt: now,
      events: {
        create: [
          { type: "CREATED", actorId: user.id, message: "Complaint filed." },
        ],
      },
      evidence: {
        create: input.evidence.map((e) => ({
          url: e.url,
          kind: e.kind,
          filename: e.filename,
          sizeBytes: e.sizeBytes,
          lat: e.lat,
          lng: e.lng,
          takenAt: e.takenAt ? new Date(e.takenAt) : undefined,
        })),
      },
    },
    select: { id: true, number: true, status: true, slaDueAt: true, title: true },
  });

  // Reputation + First Voice badge (§13 Phase 1.6).
  if (firstComplaint) await awardBadge(user.id, "first-voice");
  await recomputeReputation(user.id);

  return ok({ case: created }, 201);
}
