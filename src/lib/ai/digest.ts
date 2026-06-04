import { callJSON } from "@/lib/ai/client";
import { trendDigest } from "@/lib/ai/prompts";
import { TrendDigestOutput } from "@/schemas/ai";

export interface DigestInput {
  periodDays: number;
  categories: string;
  wardBreaches: string;
  clusters: string;
}

export async function generateDigest(input: DigestInput) {
  return callJSON({
    version: trendDigest.version,
    system: trendDigest.system,
    user: trendDigest.user(input),
    schema: TrendDigestOutput,
    fallback: {
      headline: "Top civic issues this period",
      narrative:
        "Automated digest is unavailable. Review the recurring clusters and ward breach rates below for the current hotspots.\n\nPrioritise the highest-volume categories and wards with the lowest on-time resolution.",
      interventions: [
        "Allocate extra crews to the top breaching ward.",
        "Audit the most-recurring category for a systemic root cause.",
        "Set a weekly review on escalated cases.",
      ],
    },
    temperature: 0.4,
  });
}
