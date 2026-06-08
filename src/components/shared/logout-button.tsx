"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const t = useT();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={loading}
      aria-label={t("common.signOut")}
      className={cn("text-danger hover:text-danger", className)}
    >
      <LogOut />
      {t("common.signOut")}
    </Button>
  );
}
