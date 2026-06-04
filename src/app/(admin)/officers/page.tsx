import { requireRole } from "@/lib/auth";
import { getOfficerRows } from "@/lib/admin-stats";
import { OfficersTable } from "@/components/admin/officers-table";

export default async function AdminOfficers() {
  await requireRole(["ADMIN"]);
  const rows = await getOfficerRows();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">
          Officer accountability
        </h1>
        <p className="text-muted-foreground text-sm">
          Sort by any column · click a row to drill down.
        </p>
      </div>
      <OfficersTable rows={rows} />
    </div>
  );
}
