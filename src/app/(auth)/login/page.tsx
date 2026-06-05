import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, homePathForRole } from "@/lib/auth";
import { Brand } from "@/components/shared/brand";
import { LoginForm } from "@/components/auth/login-form";
import { ThemedHero } from "@/components/art/themed-hero";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathForRole(user.role));

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <Brand href="/login" />
      <div className="border-border shadow-elev-1 w-full max-w-md overflow-hidden rounded-lg border">
        <ThemedHero />
      </div>
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
