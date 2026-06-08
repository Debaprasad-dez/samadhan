"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Pending = { url: string; pop: boolean };

/**
 * Unsaved-form navigation guard. While `active`, any attempt to leave the route
 * — clicking an in-app link, the browser Back button, or closing/refreshing the
 * tab — is intercepted and the user must choose **Save draft**, **Discard**, or
 * **Keep editing** first. App Router has no native route-leave hook, so this
 * captures link clicks, `popstate`, and `beforeunload` directly.
 */
export function LeaveGuard({
  active,
  onSaveDraft,
  onDiscard,
}: {
  active: boolean;
  onSaveDraft: () => void;
  onDiscard: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, setPending] = useState<Pending | null>(null);
  const formUrlRef = useRef("");

  useEffect(() => {
    if (active) formUrlRef.current = window.location.pathname + window.location.search;
  }, [active]);

  // Intercept in-app link clicks (capture phase, before next/link handles them).
  useEffect(() => {
    if (!active) return;
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        anchor.getAttribute("target") === "_blank" ||
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return;
      if (href === pathname) return;
      e.preventDefault();
      e.stopPropagation();
      setPending({ url: href, pop: false });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [active, pathname]);

  // Tab close / refresh / hard navigation → native browser prompt.
  useEffect(() => {
    if (!active) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [active]);

  // Browser Back/Forward.
  useEffect(() => {
    if (!active) return;
    const formUrl = window.location.pathname + window.location.search;
    const onPop = () => {
      const here = window.location.pathname + window.location.search;
      if (here === formUrl) return;
      // bounce the URL back to the form, then prompt
      window.history.pushState(null, "", formUrl);
      setPending({ url: here, pop: true });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [active]);

  const leave = useCallback(
    (dest: string) => {
      router.push(dest);
    },
    [router],
  );

  const handleSave = () => {
    onSaveDraft();
    const p = pending;
    setPending(null);
    if (p) leave(p.url);
  };
  const handleDiscard = () => {
    onDiscard();
    const p = pending;
    setPending(null);
    if (p) leave(p.url);
  };
  const handleStay = () => {
    // For a Back attempt we already bounced the URL; force the form to re-render
    // so URL and content agree (form state is preserved in the store).
    if (pending?.pop && formUrlRef.current) router.replace(formUrlRef.current);
    setPending(null);
  };

  return (
    <Dialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) handleStay();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save your complaint draft?</DialogTitle>
          <DialogDescription>
            You have an unsaved complaint in progress. Save it as a draft to
            finish later, or discard it. It won&rsquo;t be filed until you
            submit.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={handleStay}>
            Keep editing
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDiscard}>
              <Trash2 className="h-4 w-4" />
              Discard
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save draft
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
