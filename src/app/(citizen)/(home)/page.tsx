import { requireRole } from "@/lib/auth";
import { HomeView, loadHome } from "@/components/citizen/views/home-view";

// Deliberately not async: the static shell streams at once, and each data
// slot inside HomeView resolves from this one promise.
export default function CitizenHome() {
  const data = requireRole(["CITIZEN"]).then(loadHome);
  data.catch(() => {}); // awaited by the slots; this only keeps a redirect from logging as unhandled
  return <HomeView data={data} />;
}
