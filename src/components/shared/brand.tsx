import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span
        className="inline-block h-2.5 w-2.5 rounded-full bg-brand"
        aria-hidden
      />
      <span className="font-display text-xl font-semibold tracking-tight">
        Samadhan
      </span>
    </Link>
  );
}
