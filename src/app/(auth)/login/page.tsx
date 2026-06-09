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
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Full-window hero behind the form. SceneHero feathers its own top and
          bottom edges to transparent, so it melts into the page background. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0">
        <ThemedHero />
      </div>

      {/* Content sits over the hero; the form is pulled up so it overlaps the
          lower half of the image rather than dropping below it. */}
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 pb-12">
        <div className="pt-24 sm:pt-28">
          <Brand href="/login" size="lg" />
        </div>

        <div className="mt-10 w-full">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <Link
          href="/role-switch"
          className="text-muted-foreground hover:text-foreground mt-6 text-sm underline-offset-4 hover:underline"
        >
          Just exploring? Try a demo persona →
        </Link>
      </div>
    </div>
  );
}
