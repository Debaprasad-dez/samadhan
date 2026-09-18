import { CasesView } from "@/components/citizen/views/cases-view";

// In its own (list) group so this shell wraps only the list. Sitting directly
// under cases/, it was an ancestor of /cases/[id], and a case tapped before its
// own prefetch landed briefly showed the list's skeleton instead of its own.
export default function Loading() {
  return <CasesView data={null} />;
}
