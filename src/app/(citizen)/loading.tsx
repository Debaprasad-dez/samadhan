import { ChomeSkeleton } from "@/components/citizen/skeletons";

// Fallback for citizen screens without their own loading state. Drawn from
// `.chome` tokens so it matches the page's theme — the previous Tailwind
// skeleton followed a separate light/dark and could go black on a light page.
export default function Loading() {
  return <ChomeSkeleton />;
}
