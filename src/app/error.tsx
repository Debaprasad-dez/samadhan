"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Root error boundary (§10.3).
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In v1, log locally; client-error forwarding endpoint is a later phase.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-3xl font-semibold">
        Something went wrong.
      </h1>
      <p className="text-muted-foreground max-w-md">
        Apologies &mdash; an unexpected error occurred. You can try again. If it
        persists, please let us know.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
