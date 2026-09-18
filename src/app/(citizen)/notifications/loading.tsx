import { NotificationsView } from "@/components/citizen/views/notifications-view";

// The same view with no data: static copy in place, the sorting bench
// assembling itself in the hero, skeletons in every slot.
export default function Loading() {
  return <NotificationsView data={null} />;
}
