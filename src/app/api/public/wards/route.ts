import { ok } from "@/lib/api";
import { getWardStats } from "@/lib/ward-stats";

export type { WardStat } from "@/lib/ward-stats";

export async function GET() {
  return ok({ wards: await getWardStats() });
}
