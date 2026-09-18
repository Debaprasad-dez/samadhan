import { CaseView } from "@/components/citizen/views/case-view";

// The same view with no data: static copy in place, the journey road
// assembling itself in the hero, skeletons in every slot.
export default function Loading() {
  return <CaseView data={null} />;
}
