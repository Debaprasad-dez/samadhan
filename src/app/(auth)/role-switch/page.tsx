import { notFound } from "next/navigation";
import { Brand } from "@/components/shared/brand";
import { RoleSwitcher } from "@/components/auth/role-switcher";

// Demo-only persona switcher (§4.4). Hidden unless NEXT_PUBLIC_DEMO_MODE is on.
export default function RoleSwitchPage() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") notFound();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <Brand href="/login" />
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold">
          Choose a demo persona
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Jump straight in as a citizen, officer, or administrator.
        </p>
      </div>
      <RoleSwitcher />
    </div>
  );
}
