import { requireRole } from "@/lib/auth";
import { ProfileView, loadProfile } from "@/components/citizen/views/profile-view";

// Deliberately not async: the static shell streams at once, and each data
// slot inside ProfileView resolves from this one promise.
export default function ProfilePage() {
  const data = requireRole(["CITIZEN"]).then(loadProfile);
  data.catch(() => {}); // awaited by the slots; this only keeps a redirect from logging as unhandled
  return <ProfileView data={data} />;
}
