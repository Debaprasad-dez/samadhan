import { Suspense, type ReactNode } from "react";

/**
 * One piece of data-driven UI inside an otherwise static page.
 *
 * Each tab page is a single view rendered twice. From `loading.tsx` it gets
 * `data={null}`, so every slot shows its skeleton while the static copy around
 * it is already on screen — and because that loading state is what Next
 * prefetches for the nav bar, a tab switch paints it with no server trip.
 * From `page.tsx` it gets the page's one data promise: every slot awaits the
 * same promise, so there is still a single round of queries, but none of the
 * static markup between slots waits for it.
 */
export function Slot<T>({
  data,
  fallback,
  children,
}: {
  data: Promise<T> | null;
  fallback: ReactNode;
  children: (d: T) => ReactNode;
}) {
  if (!data) return <>{fallback}</>;
  return (
    <Suspense fallback={fallback}>
      <Resolve data={data}>{children}</Resolve>
    </Suspense>
  );
}

async function Resolve<T>({
  data,
  children,
}: {
  data: Promise<T>;
  children: (d: T) => ReactNode;
}) {
  return <>{children(await data)}</>;
}
