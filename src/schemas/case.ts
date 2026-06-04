import { z } from "zod";

// Ward codes per §8.2 strict format (e.g. "A", "FS", "KE").
const wardCode = z.string().regex(/^[A-Z]{1,3}\d{0,2}$/);

export const CreateCaseInput = z.object({
  title: z.string().min(5).max(80),
  body: z.string().min(30).max(2000),
  wardCode,
  departmentCode: z.string(),
  categoryId: z.string(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  isPublic: z.boolean().default(true),
  evidence: z
    .array(
      z.object({
        url: z.string(),
        kind: z.enum(["photo", "video"]),
        filename: z.string(),
        sizeBytes: z.number().int().positive(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        takenAt: z.string().datetime().optional(),
      }),
    )
    .max(5)
    .default([]),
});
export type CreateCaseInput = z.infer<typeof CreateCaseInput>;

export const StatusUpdateInput = z.object({
  status: z.enum([
    "ACKNOWLEDGED",
    "IN_PROGRESS",
    "AWAITING_INFO",
    "RESOLVED",
    "ESCALATED",
  ]),
  message: z.string().max(2000).optional(),
});
export type StatusUpdateInput = z.infer<typeof StatusUpdateInput>;

export const CloseCaseInput = z.object({
  closureNote: z.string().min(50).max(2000),
  beforeEvidenceId: z.string().optional(),
  afterEvidenceUrl: z.string().optional(),
});
export type CloseCaseInput = z.infer<typeof CloseCaseInput>;

export const CosignInput = z.object({
  reason: z.string().min(10).max(200),
});
export type CosignInput = z.infer<typeof CosignInput>;

export const ReopenInput = z.object({
  reason: z.string().min(10).max(500),
});
export type ReopenInput = z.infer<typeof ReopenInput>;

export const ReassignInput = z.object({
  toUserId: z.string(),
  reason: z.string().min(5).max(500),
});
export type ReassignInput = z.infer<typeof ReassignInput>;

export const RequestInfoInput = z.object({
  question: z.string().min(5).max(500),
});
export type RequestInfoInput = z.infer<typeof RequestInfoInput>;
