import { callJSON, aiEnabled } from "@/lib/ai/client";
import { duplicateVerifier } from "@/lib/ai/prompts";
import { DuplicatesOutput } from "@/schemas/ai";
import { db } from "@/lib/db";

const STOP = new Set([
  "the", "a", "an", "is", "are", "in", "on", "at", "of", "for", "and", "to",
  "near", "has", "have", "been", "this", "that", "with", "my", "our", "from",
  "since", "days", "day", "ward", "residents",
]);

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const uni = a.size + b.size - inter;
  return uni === 0 ? 0 : inter / uni;
}

export interface DuplicateMatch {
  caseId: string;
  title: string;
  similarity: number;
  distanceKm: number;
}

/** §5.4.3: Jaccard candidate search + (when enabled) LLM semantic verification. */
export async function findDuplicates(
  title: string,
  body: string,
  wardCode: string,
): Promise<DuplicateMatch[]> {
  const newTokens = tokenize(`${title} ${body}`);

  const candidates = await db.case.findMany({
    where: { wardCode, isPublic: true, status: { not: "CLOSED" } },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: { id: true, title: true, body: true, number: true },
  });

  const scored = candidates
    .map((c) => ({
      caseId: c.id,
      title: c.title,
      similarity: Number(jaccard(newTokens, tokenize(`${c.title} ${c.body}`)).toFixed(2)),
      distanceKm: 0,
    }))
    .filter((m) => m.similarity > 0.12)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);

  if (!aiEnabled() || scored.length === 0) {
    return scored.filter((m) => m.similarity >= 0.2).slice(0, 3);
  }

  const candText = scored.map((m) => `${m.caseId} | ${m.title}`).join("\n");
  const res = await callJSON({
    version: duplicateVerifier.version,
    system: duplicateVerifier.system,
    user: duplicateVerifier.user(title, body, wardCode, candText),
    schema: DuplicatesOutput,
    fallback: { matches: [] },
    temperature: 0,
  });

  if (res.fallback) return scored.slice(0, 3);

  return res.data.matches
    .filter((m) => m.isSame)
    .map((m) => {
      const s = scored.find((x) => x.caseId === m.caseId);
      return {
        caseId: m.caseId,
        title: s?.title ?? "",
        similarity: m.similarity,
        distanceKm: 0,
      };
    })
    .slice(0, 3);
}
