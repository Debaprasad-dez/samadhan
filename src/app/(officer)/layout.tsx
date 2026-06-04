import { requireRole } from "@/lib/auth";
import { SidebarShell } from "@/components/shared/sidebar-shell";

export default async function OfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["OFFICER"]);
  return (
    <SidebarShell user={user} variant="officer">
      {children}
    </SidebarShell>
  );
}
