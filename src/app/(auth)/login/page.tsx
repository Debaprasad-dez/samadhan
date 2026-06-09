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

      {/* Content sits over the hero, vertically centred. */}
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="relative mb-9">
          {/* frosted blur so the brand reads cleanly over the busy art */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -inset-y-6 -z-10 rounded-[2.5rem]"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, color-mix(in srgb,var(--g-bg) 72%,transparent) 0%, transparent 72%)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          />
          <Brand href="/login" size="lg" animated />
        </div>

        <div className="w-full">
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
