"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  PlayCircle,
  HelpCircle,
  CheckCheck,
  Loader2,
  UserPlus,
} from "lucide-react";
import {
  useCaseEvent,
  useCloseCase,
  useRequestInfo,
  useReassign,
} from "@/hooks/use-officer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CaseStatus } from "@/types";

export function CaseActions({
  caseId,
  status,
  canReassign = false,
  officers = [],
}: {
  caseId: string;
  status: CaseStatus;
  canReassign?: boolean;
  officers?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const event = useCaseEvent();
  const close = useCloseCase();
  const requestInfo = useRequestInfo();
  const reassign = useReassign();

  const [closeOpen, setCloseOpen] = useState(false);
  const [note, setNote] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [reassignOpen, setReassignOpen] = useState(false);
  const [toUserId, setToUserId] = useState("");
  const [reassignReason, setReassignReason] = useState("");

  const done = status === "CLOSED";

  function setStatus(next: CaseStatus, label: string) {
    event.mutate(
      { id: caseId, status: next },
      {
        onSuccess: () => {
          toast.success(label);
          router.refresh();
        },
        onError: (e) => toast.error(e.message),
      },
    );
  }

  function submitClose() {
    close.mutate(
      { id: caseId, closureNote: note },
      {
        onSuccess: (res) => {
          setCloseOpen(false);
          setNote("");
          if (res.quality.isBoilerplate || res.quality.score < 5) {
            toast.warning(
              `Closed, but quality looks low (${res.quality.score}/10). ${res.quality.reasoning}`,
            );
          } else {
            toast.success(`Closed · quality ${res.quality.score}/10.`);
          }
          router.refresh();
        },
        onError: (e) => toast.error(e.message),
      },
    );
  }

  function submitInfo() {
    requestInfo.mutate(
      { id: caseId, question },
      {
        onSuccess: () => {
          setInfoOpen(false);
          setQuestion("");
          toast.success("Information requested from the citizen.");
          router.refresh();
        },
        onError: (e) => toast.error(e.message),
      },
    );
  }

  function submitReassign() {
    reassign.mutate(
      { id: caseId, toUserId, reason: reassignReason },
      {
        onSuccess: () => {
          setReassignOpen(false);
          setToUserId("");
          setReassignReason("");
          toast.success("Case reassigned.");
          router.refresh();
        },
        onError: (e) => toast.error(e.message),
      },
    );
  }

  if (done) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground text-sm">
            This case is closed. No further actions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="text-sm font-semibold">Actions</p>

        <Button
          className="w-full justify-start"
          variant="outline"
          disabled={event.isPending || status === "ACKNOWLEDGED"}
          onClick={() => setStatus("ACKNOWLEDGED", "Acknowledged.")}
        >
          <Check /> Acknowledge
        </Button>

        <Button
          className="w-full justify-start"
          variant="outline"
          disabled={event.isPending || status === "IN_PROGRESS"}
          onClick={() => setStatus("IN_PROGRESS", "Marked in progress.")}
        >
          <PlayCircle /> Move to in progress
        </Button>

        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={() => setInfoOpen(true)}
        >
          <HelpCircle /> Request more info
        </Button>

        {canReassign && officers.length > 0 && (
          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={() => setReassignOpen(true)}
          >
            <UserPlus /> Reassign
          </Button>
        )}

        <Button
          className="w-full justify-start"
          onClick={() => setCloseOpen(true)}
        >
          <CheckCheck /> Close with proof
        </Button>
      </CardContent>

      {/* Close dialog */}
      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close case</DialogTitle>
            <DialogDescription>
              Describe the action taken (min 50 characters). AI scores the
              closure quality.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="note">Closure note</Label>
            <Textarea
              id="note"
              rows={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was done, where, and how it was verified…"
            />
            <p
              className={`text-xs ${note.trim().length < 50 ? "text-muted-foreground" : "text-success"}`}
            >
              {note.length}/2000 · min 50
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitClose}
              disabled={close.isPending || note.trim().length < 50}
            >
              {close.isPending && <Loader2 className="animate-spin" />}
              Close case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request info dialog */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request more information</DialogTitle>
            <DialogDescription>
              The citizen is notified and the case moves to “Awaiting info”.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="q">Question</Label>
            <Textarea
              id="q"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Could you share the exact location and a photo?"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInfoOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitInfo}
              disabled={requestInfo.isPending || question.trim().length < 5}
            >
              {requestInfo.isPending && <Loader2 className="animate-spin" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign dialog (dept lead / admin) */}
      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign case</DialogTitle>
            <DialogDescription>
              Move this case to another officer in the department.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Officer</Label>
              <Select value={toUserId} onValueChange={setToUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select officer" />
                </SelectTrigger>
                <SelectContent>
                  {officers.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rr">Reason</Label>
              <Textarea
                id="rr"
                rows={2}
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="Why is this being reassigned?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitReassign}
              disabled={
                reassign.isPending || !toUserId || reassignReason.trim().length < 5
              }
            >
              {reassign.isPending && <Loader2 className="animate-spin" />}
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
