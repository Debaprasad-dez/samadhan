import { Skeleton } from "@/components/ui/skeleton";

// Instant route loader (App Router loading.tsx). Next streams this the moment a
// navigation starts — so transitions feel immediate while the server segment
// fetches. A themed top progress bar communicates "loading", and a skeleton
// holds the layout to prevent jank. Mode: hero (citizen) | list | form.
export function RouteLoading({
  variant = "hero",
}: {
  variant?: "hero" | "list" | "form";
}) {
  return (
    <>
      {/* top progress bar — disappears when the real page replaces this */}
      <div className="fixed inset-x-0 top-0 z-[60] h-[3px] overflow-hidden">
        <div className="route-bar bg-brand h-full origin-left" />
      </div>

      <div className="space-y-6" aria-busy aria-label="Loading">
        {variant === "hero" && (
          <>
            <Skeleton className="h-56 w-full rounded-2xl md:h-72" />
            <Skeleton className="h-28 w-full rounded-3xl" />
            <div className="space-y-2.5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          </>
        )}

        {variant === "list" && (
          <>
            <Skeleton className="h-8 w-48" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </>
        )}

        {variant === "form" && (
          <div className="mx-auto max-w-md space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        )}
      </div>
    </>
  );
}
