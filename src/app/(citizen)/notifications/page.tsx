import { requireRole } from "@/lib/auth";
import { NotificationsView, loadNotifications } from "@/components/citizen/views/notifications-view";

// Deliberately not async: the static shell streams at once, and each data
// slot inside NotificationsView resolves from this one promise.
export default function NotificationsPage() {
  const data = requireRole(["CITIZEN"]).then(loadNotifications);
  data.catch(() => {}); // awaited by the slots; this only keeps a redirect from logging as unhandled
  return <NotificationsView data={data} />;
}
