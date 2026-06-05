import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Error404 } from "@/components/art/empty";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <Error404 className="w-56" />
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
