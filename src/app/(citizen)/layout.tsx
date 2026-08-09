import { requireRole } from "@/lib/auth";
import { touchStreak } from "@/lib/streak";
import { CitizenShell } from "@/components/shared/citizen-shell";
import { BottomNav } from "@/components/citizen/bottom-nav";
import { SwipeNav } from "@/components/citizen/swipe-nav";
import { Choreography } from "@/components/citizen/choreography";

export default async function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["CITIZEN"]);
  // Visit ping for streaks (debounced once/day, §5.3.3).
  await touchStreak(user.id);
  // The nav lives here, beside the page slot, so a route change never unmounts
  // it — it stays on screen while the next page loads.
  return (
    <>
      <Choreography />
      <CitizenShell user={user}>{children}</CitizenShell>
      <BottomNav />
      <SwipeNav />
    </>
  );
}
