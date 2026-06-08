import Link from "next/link";
import Image from "next/image";
import { ThumbsUp, Users } from "lucide-react";
import { StatusBadge, SeverityChip } from "@/components/case/status-badge";
import { CategoryIcon } from "@/components/art/category-icon";
import { CardArtwork } from "@/components/art/card-artwork";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelative, humanizeCode } from "@/lib/utils";
import type { CaseListItem } from "@/hooks/use-cases";

export function CaseCard({ c }: { c: CaseListItem }) {
  const thumb = c.evidence?.[0];
  return (
    <Link href={`/cases/${c.id}`} className="block">
      <Card className="transition-all hover:-translate-y-0.5 hover:shadow-elev-2">
        <CardContent className="flex gap-4 p-4">
          {thumb?.kind === "photo" ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
              <Image
                src={thumb.url}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          ) : (
            <CardArtwork
              category={c.departmentCode}
              seed={c.id}
              compact
              className="h-16 w-16 shrink-0 rounded-md border"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground font-mono text-xs">
                {c.number}
              </p>
              <StatusBadge status={c.status} />
            </div>
            <p className="mt-0.5 truncate font-medium">{c.title}</p>
            <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <SeverityChip severity={c.severity} />
              <span className="inline-flex items-center gap-1">
                <CategoryIcon department={c.departmentCode} className="h-3.5 w-3.5" />
                {humanizeCode(c.departmentCode)}
              </span>
              <span>Ward {c.wardCode}</span>
              <span className="inline-flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                {c._count.upvotes}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                {c._count.cosigns}
              </span>
              <span>· {formatRelative(c.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
