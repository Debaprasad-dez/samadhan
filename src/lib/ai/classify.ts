import { callJSON } from "@/lib/ai/client";
import { classifier } from "@/lib/ai/prompts";
import { ClassifyOutput } from "@/schemas/ai";
import { CATEGORIES } from "@/lib/seed-data";
import type { Severity } from "@/types";

const KEYWORDS: Array<[RegExp, string]> = [
  [/garbage|trash|bin|litter|waste|sweep|toilet|drain|dead animal/i, "SANITATION"],
  [/water|tap|pipe|leak|supply|contaminat/i, "WATER"],
  [/light|electric|power|wire|voltage|outage|meter|bill/i, "ELECTRICITY"],
  [/road|pothole|footpath|pavement|signage|waterlog|encroach/i, "ROADS"],
  [/mosquito|dengue|food|stray|hospital|health|epidemic|disease/i, "HEALTH"],
  [/school|teacher|student|meal|admission|education/i, "EDUCATION"],
  [/noise|parking|police|traffic|nuisance|safety|theft/i, "POLICE"],
  [/building|bridge|flyover|park|construction|property/i, "PUBLIC_WORKS"],
];

function fallbackClassify(title: string, body: string): {
  departmentCode: string;
  categoryId: string;
  severity: Severity;
  confidence: number;
  reasoning: string;
} {
  const text = `${title} ${body}`;
  const dept = KEYWORDS.find(([re]) => re.test(text))?.[1] ?? "SANITATION";
  const cat = CATEGORIES.find((c) => c.departmentCode === dept)!;
  return {
    departmentCode: dept,
    categoryId: cat.id,
    severity: "MEDIUM",
    confidence: 0.4,
    reasoning: "Heuristic keyword match (AI unavailable).",
  };
}

/** Pick the best category within a department by name overlap with the complaint text. */
function bestCategoryInDept(deptCode: string, text: string): string {
  const cats = CATEGORIES.filter((c) => c.departmentCode === deptCode);
  const t = text.toLowerCase();
  let best = cats[0];
  let bestScore = -1;
  for (const c of cats) {
    const words = c.name.toLowerCase().split(/\s+/);
    const score = words.reduce((n, w) => (w.length > 2 && t.includes(w) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best.id;
}

export async function classifyComplaint(
  title: string,
  body: string,
  wardCode?: string,
) {
  const res = await callJSON({
    version: classifier.version,
    system: classifier.system,
    user: classifier.user(title, body, wardCode),
    schema: ClassifyOutput,
    fallback: fallbackClassify(title, body),
    temperature: 0.1,
  });

  // Department must be one of the 8 known codes; else fall back entirely.
  const validDept = CATEGORIES.some(
    (c) => c.departmentCode === res.data.departmentCode,
  );
  if (!validDept) {
    const fb = fallbackClassify(title, body);
    return { ok: false, fallback: true, data: { ...res.data, ...fb } };
  }

  // Department is AI-derived; if the category id is off, remap to the best in-dept
  // category by name (keeps the AI's routing + confidence, no full fallback).
  const catValid = CATEGORIES.some(
    (c) => c.id === res.data.categoryId && c.departmentCode === res.data.departmentCode,
  );
  const categoryId = catValid
    ? res.data.categoryId
    : bestCategoryInDept(res.data.departmentCode, `${title} ${body}`);

  return { ok: res.ok, fallback: res.fallback, data: { ...res.data, categoryId } };
}
