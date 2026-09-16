import { CasesView } from "@/components/citizen/views/cases-view";

// The same view with no data: static copy in place, skeletons in every slot.
// This is what Next prefetches for the nav bar, so the tab paints with no
// round trip.
export default function Loading() {
  return <CasesView data={null} />;
}
