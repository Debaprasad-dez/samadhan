import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, homePathForRole } from "@/lib/auth";
import { LoginCard } from "@/components/auth/login-card";
import { LoginBelow } from "@/components/auth/login-below";
import { CivicStrip } from "@/components/auth/civic-strip";

/** The chakra's own count, drawn as ticks inside the ring. */
const SPOKES = Array.from({ length: 24 }, (_, i) => i * 15);

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathForRole(user.role));

  return (
    <div className="chome clogin">
      {/* All four palettes plus the flag's saffron and green, drifting. The
          accent the card borrows cycles through the same set — see --accent. */}
      <div className="aurora" aria-hidden="true">
        <i className="halo" />
      </div>

      <div className="page">
        <div className="brandrow fadeup" style={{ animationDelay: ".05s" }}>
          {/* Ring in all four brand colours, turning; 24 chakra ticks turning
              the other way inside it; then the tick lands. */}
          <svg className="sigil" viewBox="0 0 40 40" aria-hidden="true">
            <defs>
              <linearGradient id="samadhan-spectrum" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#B0592A" />
                <stop offset="26%" stopColor="#FF9933" />
                <stop offset="50%" stopColor="#C7A458" />
                <stop offset="74%" stopColor="#2560C9" />
                <stop offset="100%" stopColor="#138808" />
              </linearGradient>
            </defs>
            <g className="chakra">
              {SPOKES.map((deg) => (
                <line key={deg} x1="20" y1="5.9" x2="20" y2="10.6" transform={`rotate(${deg} 20 20)`} />
              ))}
            </g>
            <g className="spin">
              <circle className="r1" cx="20" cy="20" r="16.5" transform="rotate(-72 20 20)" />
            </g>
            <path className="tk" d="M13 20.4 18 25.2 27.4 14.8" />
          </svg>
          <span className="wordmark">Samadhan</span>
        </div>

        <Suspense fallback={null}>
          <LoginCard />
        </Suspense>

        <CivicStrip />
        <LoginBelow />
      </div>
    </div>
  );
}
