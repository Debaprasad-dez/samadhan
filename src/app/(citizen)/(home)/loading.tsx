import { HomeView } from "@/components/citizen/views/home-view";

// The same view with no data: static copy in place, skeletons in every slot.
// This is what Next prefetches for the nav bar, so tapping Home paints it with
// no round trip.
export default function Loading() {
  return <HomeView data={null} />;
}
