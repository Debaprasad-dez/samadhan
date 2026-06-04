import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Role, SessionUser } from "@/types";

export interface SessionData {
  userId?: string;
  role?: Role;
  iat?: number;
}

const password = process.env.SESSION_PASSWORD;
if (!password || password.length < 32) {
  // Fail loudly at boot rather than silently issuing weak cookies (§9.2).
  throw new Error(
    "SESSION_PASSWORD env var must be set and at least 32 characters long.",
  );
}

export const sessionOptions: SessionOptions = {
  password,
  cookieName: "samadhan_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  },
};

/** Raw iron-session object (with .save()/.destroy()). */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/** Resolve the current user from session + DB, or null. Safe to call anywhere server-side. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session.userId) return null;

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return null;

  return {
    id: user.id,
    role: user.role as Role,
    name: user.name,
    wardCode: user.wardCode,
    departmentCode: user.departmentCode,
    reputation: user.reputation,
    language: user.language,
  };
}

/** For layouts/pages: redirect unauthenticated → /login, wrong-role → /role-switch. */
export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!roles.includes(user.role)) redirect("/role-switch");
  return user;
}

/** For layouts/pages: any authenticated user. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function createSession(userId: string, role: Role): Promise<void> {
  const session = await getSession();
  session.userId = userId;
  session.role = role;
  session.iat = Date.now();
  await session.save();
}

export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

/** Default landing path per role (§6.1). */
export function homePathForRole(role: Role): string {
  switch (role) {
    case "OFFICER":
      return "/inbox";
    case "ADMIN":
      return "/overview";
    default:
      return "/";
  }
}
