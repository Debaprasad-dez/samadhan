import { addDays } from "date-fns";
import { slaDaysForCategory } from "@/lib/seed-data";

/** Due date for a case = createdAt + category SLA days (§5.7.1). */
export function computeSlaDueAt(createdAt: Date, categoryId: string): Date {
  return addDays(createdAt, slaDaysForCategory(categoryId));
}

export type SlaState = "safe" | "warning" | "breach";

/**
 * SLA ring colour bands (§5.1.3):
 *  - safe (green):    > 50% of the window remaining
 *  - warning (amber): 10–50% remaining
 *  - breach (red):    < 10% remaining or past due
 */
export function slaState(
  createdAt: Date,
  dueAt: Date,
  now: Date = new Date(),
): SlaState {
  const total = dueAt.getTime() - createdAt.getTime();
  const left = dueAt.getTime() - now.getTime();
  if (left <= 0) return "breach";
  const frac = total > 0 ? left / total : 0;
  if (frac < 0.1) return "breach";
  if (frac < 0.5) return "warning";
  return "safe";
}

export function isBreached(dueAt: Date, now: Date = new Date()): boolean {
  return now.getTime() > dueAt.getTime();
}
