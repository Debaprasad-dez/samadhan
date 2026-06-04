"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ThumbsUp, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function CaseEngagement({
  caseId,
  isOwner,
  initialUpvotes,
  viewerUpvoted,
  initialCosigns,
  viewerCosigned,
}: {
  caseId: string;
  isOwner: boolean;
  initialUpvotes: number;
  viewerUpvoted: boolean;
  initialCosigns: number;
  viewerCosigned: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(initialUpvotes);
  const [up, setUp] = useState(viewerUpvoted);
  const [cosigns, setCosigns] = useState(initialCosigns);
  const [cosigned, setCosigned] = useState(viewerCosigned);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  async function toggleUpvote() {
    setBusy(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/upvote`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) toast.error(d?.error?.message ?? "Couldn't upvote.");
      else {
        setUp(d.upvoted);
        setCount(d.count);
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitCosign() {
    setBusy(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/cosign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d?.error?.message ?? "Couldn't co-sign.");
      } else {
        setCosigned(true);
        setCosigns(d.count);
        setOpen(false);
        setReason("");
        toast.success("Co-signed. The author has been notified.");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  if (isOwner) {
    return (
      <div className="text-muted-foreground flex items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <ThumbsUp className="h-4 w-4" /> {count}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-4 w-4" /> {cosigns} co-signers
        </span>
        <span className="text-xs">This is your complaint.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={up ? "default" : "outline"}
        size="sm"
        onClick={toggleUpvote}
        disabled={busy}
      >
        <ThumbsUp className={cn(up && "fill-current")} />
        {up ? "Upvoted" : "Upvote"} · {count}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={cosigned}
      >
        <Users />
        {cosigned ? "Co-signed" : "Co-sign"} · {cosigns}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Co-sign this complaint</DialogTitle>
            <DialogDescription>
              Add a line on why this matters to you (10–200 characters). The
              author is notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Why this matters to me</Label>
            <Textarea
              id="reason"
              rows={3}
              maxLength={200}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. My family walks past here every day."
            />
            <p className="text-muted-foreground text-xs">{reason.length}/200</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitCosign}
              disabled={busy || reason.trim().length < 10}
            >
              {busy && <Loader2 className="animate-spin" />}
              Co-sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
