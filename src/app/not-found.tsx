import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-muted-foreground font-mono text-sm">404</p>
      <h1 className="font-display text-3xl font-semibold">
        This page took a detour.
      </h1>
      <p className="text-muted-foreground max-w-md">
        The page you&rsquo;re looking for doesn&rsquo;t exist or was moved.
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
