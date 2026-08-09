"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

const KEY = "samadhan.played";

/** `/cases/abc123` and `/cases/def456` are one screen, and share one entrance. */
function screen(pathname: string): string {
  const [, first] = pathname.split("/");
  return first ? `/${first}` : "/";
}

function played(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

/** Cleared on sign-out, so the next person at this device gets the full build. */
export function clearChoreography() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* private mode — the entrance simply plays again */
  }
}

/**
 * A page's opening sequence is a first impression, so it plays once a session
 * and then stops asking for attention. Marking the page settled leaves the
 * ambient loops running; only the build-in is skipped.
 *
 * The class lands in a layout effect, which React runs before any hero's
 * paint effect, so a revisited page never flashes its entrance first.
 */
export function Choreography() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.querySelector(".chome");
    if (!root) return;
    const page = screen(pathname);
    const seen = played();
    if (seen.has(page)) {
      root.classList.add("settled");
      return;
    }
    root.classList.remove("settled");
    seen.add(page);
    try {
      sessionStorage.setItem(KEY, JSON.stringify([...seen]));
    } catch {
      /* private mode — the entrance simply plays again */
    }
  }, [pathname]);

  return null;
}
