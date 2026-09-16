import { ChomeSkeleton } from "@/components/citizen/skeletons";

// Without this, a case would borrow the Cases list's loading shell.
export default function Loading() {
  return <ChomeSkeleton />;
}
