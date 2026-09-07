import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, homePathForRole } from "@/lib/auth";
import { LoginCard } from "@/components/auth/login-card";
import { LoginBelow } from "@/components/auth/login-below";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathForRole(user.role));

  return (
    <div className="chome clogin">
      <div className="page">
        <div className="brandrow fadeup" style={{ animationDelay: ".05s" }}>
          {/* The ring draws itself, then the mark lands inside it. */}
          <svg className="ring" viewBox="0 0 40 40" aria-hidden="true">
            <circle className="r1" cx="20" cy="20" r="16.5" transform="rotate(-72 20 20)" />
            <path className="tk" d="M13 20.4 18 25.2 27.4 14.8" />
          </svg>
          <span className="wordmark">Samadhan</span>
        </div>

        <Suspense fallback={null}>
          <LoginCard />
        </Suspense>

        <LoginBelow />
      </div>
    </div>
  );
}
