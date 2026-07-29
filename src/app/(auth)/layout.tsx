"use client";

import { useEffect } from "react";

// Login + persona/role-switch always render in the bright Bharat Dawn light
// theme, regardless of the global light/dark toggle or auth state. Pins the
// <html> attributes on mount and restores them on unmount — this covers the
// edge case of a logged-in dark-mode user visiting /role-switch. Logged-out
// visits are already correct pre-paint via the root layout's forcedMode="light".
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const el = document.documentElement;
    const prevTheme = el.getAttribute("data-theme");
    const prevMode = el.getAttribute("data-mode");
    el.setAttribute("data-theme", "bharat-dawn");
    el.setAttribute("data-mode", "light");
    return () => {
      if (prevTheme) el.setAttribute("data-theme", prevTheme);
      if (prevMode) el.setAttribute("data-mode", prevMode);
    };
  }, []);

  return <>{children}</>;
}
