import { requireRole } from "@/lib/auth";
import { CasesView, loadCases } from "@/components/citizen/views/cases-view";

// Deliberately not async: the static shell streams at once, and each data
// slot inside CasesView resolves from this one promise.
export default function CasesPage() {
  const data = requireRole(["CITIZEN"]).then(loadCases);
  data.catch(() => {}); // awaited by the slots; this only keeps a redirect from logging as unhandled
  return <CasesView data={data} />;
}
