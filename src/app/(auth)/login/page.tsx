import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, homePathForRole } from "@/lib/auth";
import { Brand } from "@/components/shared/brand";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathForRole(user.role));

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <Brand href="/login" />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <Link
        href="/role-switch"
        className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
      >
        Just exploring? Try a demo persona →
      </Link>
    </div>
  );
}
