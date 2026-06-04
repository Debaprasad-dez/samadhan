"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SessionUser } from "@/types";

const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
  );
}

/** Client-side current user (for conditional rendering only — never authz). */
export function useSession(): SessionUser | null {
  return useContext(SessionContext);
}
