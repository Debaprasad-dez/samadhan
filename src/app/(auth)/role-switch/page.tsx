import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Brand } from "@/components/shared/brand";
import { RoleSwitcher } from "@/components/auth/role-switcher";

// Demo-only persona switcher (§4.4). Hidden unless NEXT_PUBLIC_DEMO_MODE is on.
export default function RoleSwitchPage() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") notFound();

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <Link
        href="/login"
        className="text-muted-foreground hover:text-foreground absolute left-4 top-4 flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>
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
