import { CaseView, loadCase } from "@/components/citizen/views/case-view";

// Awaits only the URL, never the database: the static shell streams at once,
// and each data slot inside CaseView resolves from this one promise.
export default async function CaseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = loadCase(id);
  data.catch(() => {}); // awaited by the slots; this only keeps notFound from logging as unhandled
  return <CaseView data={data} />;
}
