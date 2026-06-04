import { requireRole } from "@/lib/auth";
import { SidebarShell } from "@/components/shared/sidebar-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["ADMIN"]);
  return (
    <SidebarShell user={user} variant="admin">
      {children}
    </SidebarShell>
  );
}
