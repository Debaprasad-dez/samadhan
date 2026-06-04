import { getCurrentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { getOfficerRows } from "@/lib/admin-stats";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return fail("FORBIDDEN", "Admins only.", 403);
  }
  return ok({ rows: await getOfficerRows() });
}
