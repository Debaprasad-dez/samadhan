"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export interface EvidenceItem {
  url: string;
  kind: string;
  filename: string;
}

export function EvidenceGallery({ items }: { items: EvidenceItem[] }) {
  const [open, setOpen] = useState<string | null>(null);

  if (!items.length) {
    return (
      <p className="text-muted-foreground text-sm">No evidence attached.</p>
    );
  }

  const active = items.find((i) => i.url === open);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {items.map((e) =>
          e.kind === "photo" ? (
            <button
              key={e.url}
              type="button"
              onClick={() => setOpen(e.url)}
              className="focus-visible:ring-ring relative aspect-square overflow-hidden rounded-md border focus-visible:ring-2"
            >
              <Image
                src={e.url}
                alt={e.filename}
                fill
                className="object-cover transition-transform hover:scale-105"
                sizes="120px"
              />
            </button>
          ) : (
            <video
              key={e.url}
              src={e.url}
              className="aspect-square w-full rounded-md border object-cover"
              controls
            />
          ),
        )}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl p-2">
          <DialogTitle className="sr-only">Evidence preview</DialogTitle>
          {active?.kind === "photo" && (
            <div className="relative h-[70vh] w-full">
              <Image
                src={active.url}
                alt={active.filename}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
