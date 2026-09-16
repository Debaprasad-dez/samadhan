import { requireRole } from "@/lib/auth";
import { FeedView, loadFeed } from "@/components/citizen/views/feed-view";

// Awaits only the URL, never the database: the static shell streams at once,
// and each data slot inside FeedView resolves from this one promise.
export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort = "near" } = await searchParams;
  const data = requireRole(["CITIZEN"]).then((user) => loadFeed(user, sort));
  data.catch(() => {}); // awaited by the slots; this only keeps a redirect from logging as unhandled
  return <FeedView data={data} />;
}
