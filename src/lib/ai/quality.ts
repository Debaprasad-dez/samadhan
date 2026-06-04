import { callJSON } from "@/lib/ai/client";
import { qualityScorer } from "@/lib/ai/prompts";
import { QualityOutput } from "@/schemas/ai";

const BOILERPLATE = [
  "matter under examination",
  "necessary action taken",
  "issue resolved",
  "needful done",
  "disposed of as per procedure",
  "forwarded to concerned",
];

/** Heuristic fallback when AI is unavailable. */
function fallbackQuality(closureNote: string): {
  score: number;
  isBoilerplate: boolean;
  reasoning: string;
} {
  const lower = closureNote.toLowerCase();
  const hits = BOILERPLATE.filter((p) => lower.includes(p)).length;
  const isBoilerplate = hits > 0 || closureNote.length < 60;
  const score = isBoilerplate ? 3 : closureNote.length > 160 ? 7 : 5;
  return {
    score,
    isBoilerplate,
    reasoning: isBoilerplate
      ? "Closure looks generic or lacks specifics (heuristic)."
      : "Closure describes specific action (heuristic).",
  };
}

export async function scoreDisposal(
  closureNote: string,
  evidenceSummary: string,
) {
  return callJSON({
    version: qualityScorer.version,
    system: qualityScorer.system,
    user: qualityScorer.user(closureNote, evidenceSummary),
    schema: QualityOutput,
    fallback: fallbackQuality(closureNote),
    temperature: 0.1,
  });
}
