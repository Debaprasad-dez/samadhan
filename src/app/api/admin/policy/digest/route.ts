import { getCurrentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { getTrendInputs } from "@/lib/admin-stats";
import { generateDigest } from "@/lib/ai/digest";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return fail("FORBIDDEN", "Admins only.", 403);
  }
  const period = Number(new URL(req.url).searchParams.get("period")) || 30;
  const { digestInput } = await getTrendInputs(period);
  const res = await generateDigest(digestInput);
  return ok({ digest: res.data, fallback: res.fallback });
}
