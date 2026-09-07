"use client";

import { useEffect } from "react";

// Sign-in and persona switch carry their own theme row, so the theme is the
// visitor's to choose here — the same four palettes the app uses, applied
// before paint by the root layout's no-flash script.
//
// The light/dark axis stays pinned: mode is a signed-in preference, and these
// screens have no toggle to explain it. Restored on unmount so a signed-in
// dark-mode visitor returns to their own mode after /role-switch.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const el = document.documentElement;
    const prevMode = el.getAttribute("data-mode");
    el.setAttribute("data-mode", "light");
    return () => {
      if (prevMode) el.setAttribute("data-mode", prevMode);
    };
  }, []);

  return <>{children}</>;
}
