import { getCurrentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { getOverview } from "@/lib/admin-stats";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return fail("FORBIDDEN", "Admins only.", 403);
  }
  const period = Number(new URL(req.url).searchParams.get("period")) || 30;
  return ok(await getOverview(period));
}
