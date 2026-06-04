import { requireRole } from "@/lib/auth";
import { touchStreak } from "@/lib/streak";
import { CitizenShell } from "@/components/shared/citizen-shell";

export default async function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["CITIZEN"]);
  // Visit ping for streaks (debounced once/day, §5.3.3).
  await touchStreak(user.id);
  return <CitizenShell user={user}>{children}</CitizenShell>;
}
