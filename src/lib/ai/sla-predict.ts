import { callJSON } from "@/lib/ai/client";
import { slaPredictor } from "@/lib/ai/prompts";
import { SlaPredictOutput } from "@/schemas/ai";

export interface SlaPredictInput {
  department: string;
  category: string;
  wardCode: string;
  severity: string;
  medianDays: number;
}

export async function predictSla(input: SlaPredictInput) {
  return callJSON({
    version: slaPredictor.version,
    system: slaPredictor.system,
    user: slaPredictor.user(input),
    schema: SlaPredictOutput,
    fallback: {
      expectedDays: Math.max(1, Math.round(input.medianDays) || 7),
      confidence: 0.3,
    },
    temperature: 0.2,
  });
}
