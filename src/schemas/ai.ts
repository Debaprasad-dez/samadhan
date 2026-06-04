import { z } from "zod";

// AI output schemas (§14). Used to validate LLM JSON; on parse failure the route
// retries once, then returns a documented fallback. Defined now, wired in Phase 1+.

export const DraftOutput = z.object({
  title: z.string().max(80),
  body: z.string().max(800),
  notes: z.string().max(200),
});
export type DraftOutput = z.infer<typeof DraftOutput>;

export const ClassifyOutput = z.object({
  departmentCode: z.string(),
  categoryId: z.string(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().max(200).optional(),
});
export type ClassifyOutput = z.infer<typeof ClassifyOutput>;

export const DuplicatesOutput = z.object({
  matches: z.array(
    z.object({
      caseId: z.string(),
      isSame: z.boolean(),
      similarity: z.number().min(0).max(1),
      why: z.string().max(120),
    }),
  ),
});
export type DuplicatesOutput = z.infer<typeof DuplicatesOutput>;

export const SummaryOutput = z.object({
  summary: z.string(),
});
export type SummaryOutput = z.infer<typeof SummaryOutput>;

export const QualityOutput = z.object({
  score: z.number().int().min(0).max(10),
  isBoilerplate: z.boolean(),
  reasoning: z.string().max(200),
});
export type QualityOutput = z.infer<typeof QualityOutput>;

export const SlaPredictOutput = z.object({
  expectedDays: z.number().int().positive(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().max(120).optional(),
});
export type SlaPredictOutput = z.infer<typeof SlaPredictOutput>;

export const RtiDraftOutput = z.object({
  draft: z.string(),
});
export type RtiDraftOutput = z.infer<typeof RtiDraftOutput>;

export const TrendDigestOutput = z.object({
  headline: z.string().max(120),
  narrative: z.string(),
  interventions: z.array(z.string()),
});
export type TrendDigestOutput = z.infer<typeof TrendDigestOutput>;
