import { getCurrentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { getClusters, type Cluster } from "@/lib/admin-stats";
import { CATEGORIES } from "@/lib/seed-data";

// 24h in-memory cache (§5.5.3), keyed by department scope.
const CACHE_TTL = 24 * 60 * 60 * 1000;
const cache = new Map<string, { clusters: Cluster[]; at: number }>();

const deptOf = (categoryId: string) =>
  CATEGORIES.find((c) => c.id === categoryId)?.departmentCode;

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "OFFICER" && user.role !== "ADMIN")) {
    return fail("FORBIDDEN", "Officers only.", 403);
  }

  const recompute = new URL(req.url).searchParams.get("recompute") === "1";
  const key =
    user.role === "OFFICER" && user.departmentCode ? user.departmentCode : "ALL";

  const hit = cache.get(key);
  if (hit && !recompute && Date.now() - hit.at < CACHE_TTL) {
    return ok({ clusters: hit.clusters, computedAt: hit.at, cached: true });
  }

  const all = await getClusters(14);
  const clusters =
    key === "ALL" ? all : all.filter((c) => deptOf(c.categoryId) === key);

  const at = Date.now();
  cache.set(key, { clusters, at });
  return ok({ clusters, computedAt: at, cached: false });
}
