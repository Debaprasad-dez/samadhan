"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Loader2, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function RtiDraftButton({
  caseId,
  number,
}: {
  caseId: string;
  number: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");

  async function generate() {
    setOpen(true);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/rti-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d?.error?.message ?? "Couldn't draft the RTI.");
        setOpen(false);
      } else {
        setDraft(d.draft);
      }
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(draft);
    toast.success("RTI draft copied.");
  }

  function download() {
    const blob = new Blob([draft], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RTI-${number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={generate}>
        <FileText />
        Draft an RTI
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>RTI application draft</DialogTitle>
            <DialogDescription>
              Pre-filled under the RTI Act, 2005. Review, copy, and file with the
              department.
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <p className="text-muted-foreground py-10 text-center text-sm">
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              Drafting…
            </p>
          ) : (
            <Textarea
              readOnly
              value={draft}
              rows={16}
              className="font-mono text-xs"
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={copy} disabled={!draft}>
              <Copy />
              Copy
            </Button>
            <Button onClick={download} disabled={!draft}>
              <Download />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
