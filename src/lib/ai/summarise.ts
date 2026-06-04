import { callJSON } from "@/lib/ai/client";
import { officerBrief } from "@/lib/ai/prompts";
import { SummaryOutput } from "@/schemas/ai";

export interface BriefInput {
  number: string;
  title: string;
  body: string;
  wardCode: string;
  department: string;
  category: string;
  severity: string;
  createdAt: string;
  cosignCount: number;
  events: string;
}

export async function summariseCase(c: BriefInput) {
  return callJSON({
    version: officerBrief.version,
    system: officerBrief.system,
    user: officerBrief.user(c),
    schema: SummaryOutput,
    fallback: {
      summary: `${c.title}.\nStatus pending in ${c.department}, ward ${c.wardCode}.\nReview the latest events and acknowledge.`,
    },
    temperature: 0.2,
  });
}
