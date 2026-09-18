import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { WARDS } from "@/lib/seed-data";
import { WardView, loadWard } from "@/components/citizen/views/ward-view";

// Awaits only the URL, never the database: the static shell streams at once,
// and the 3D block runs as a ghost until this promise resolves.
export default async function WardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!WARDS.some((w) => w.code === code)) notFound();
  const data = getCurrentUser().then(loadWard);
  data.catch(() => {}); // awaited by the slot; this only keeps a failure from logging as unhandled
  return <WardView data={data} code={code.toLowerCase()} />;
}
