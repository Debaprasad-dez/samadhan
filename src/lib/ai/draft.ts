import { callJSON } from "@/lib/ai/client";
import { drafter } from "@/lib/ai/prompts";
import { DraftOutput } from "@/schemas/ai";

export async function draftComplaint(text: string) {
  return callJSON({
    version: drafter.version,
    system: drafter.system,
    user: drafter.user(text),
    schema: DraftOutput,
    fallback: {
      title: text.slice(0, 80),
      body: text.slice(0, 800),
      notes: "AI unavailable; original kept.",
    },
    temperature: 0.3,
  });
}
