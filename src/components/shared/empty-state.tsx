import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  illustration,
  title,
  description,
  action,
}: {
  illustration?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        {illustration && (
          <span className="text-muted-foreground h-24 w-24">{illustration}</span>
        )}
        <p className="font-display text-lg font-semibold">{title}</p>
        {description && (
          <p className="text-muted-foreground max-w-[46ch] text-sm">
            {description}
          </p>
        )}
        {action}
      </CardContent>
    </Card>
  );
}
